import { Component, OnDestroy } from '@angular/core';
import { MissionConfigService } from '../../core/mission-config.service';

export type CardAccent = 'cyan' | 'orange';

/** ≥ 72 اسمًا (12×12 ÷ 2) — أسماء Material Symbols متميزة للأزواج */
const MEMORY_ICON_NAMES: readonly string[] = [
  'shield',
  'military_tech',
  'bolt',
  'token',
  'box',
  'radar',
  'crisis_alert',
  'terminal',
  'star',
  'favorite',
  'home',
  'settings',
  'person',
  'visibility',
  'lock',
  'key',
  'schedule',
  'calendar_today',
  'mail',
  'call',
  'place',
  'map',
  'navigation',
  'compass',
  'flight',
  'train',
  'directions_car',
  'sports_esports',
  'fitness_center',
  'wifi',
  'bluetooth',
  'cloud',
  'sunny',
  'water_drop',
  'science',
  'psychology',
  'work',
  'account_balance',
  'shopping_cart',
  'inventory',
  'construction',
  'medical_services',
  'groups',
  'translate',
  'article',
  'code',
  'dataset',
  'hub',
  'memory',
  'cpu',
  'smartphone',
  'laptop',
  'router',
  'storage',
  'folder',
  'image',
  'movie',
  'music_note',
  'headphones',
  'sports_soccer',
  'hiking',
  'umbrella',
  'rocket_launch',
  'satellite_alt',
  'palette',
  'handyman',
  'agriculture',
  'museum',
  'celebration',
  'local_pizza',
  'icecream',
  'egg_alt',
  'dns',
  'developer_board',
  'tablet',
  'desktop_windows',
  'attach_file',
  'mic',
  'gaming_pad',
  'skateboarding',
  'surfing',
  'camping',
  'flashlight',
  'anchor',
  'telescope',
  'brush',
  'cottage',
  'castle',
  'theater_comedy',
  'festival',
  'cake',
  'ramen_dining',
  'bakery_dining',
  'soup_kitchen',
  'precision_manufacturing',
  'engineering',
  'emergency',
  'gavel',
  'handshake',
  'public',
  'menu_book',
  'data_object',
  'cable',
  'biotech',
  'school',
  'payment',
  'shield_moon',
  'diversity_3',
  'language',
  'book',
  'description',
  'folder_open',
  'inventory_2',
  'deployed_code',
  'integration_instructions',
  'polyline',
  'schema',
  'account_tree',
  'device_hub',
  'sensors',
  'tune',
  'graphic_eq',
  'animation',
  'auto_awesome',
  'camera',
  'videocam',
  'stadium',
  'emoji_events',
  'verified',
  'diamond',
  'workspace_premium',
  'smart_toy',
  'kayaking',
  'snowboarding',
  'scuba_diving',
  'sailing',
  'rocket',
  'satellite',
  'tsunami',
  'volcano',
  'thunderstorm',
  'ac_unit',
  'battery_charging_full',
  'electric_bolt',
  'ev_station',
  'local_gas_station',
  'airlines',
  'subway',
  'tram',
  'pedal_bike',
  'two_wheeler',
  'electric_scooter',
  'forest',
  'park',
  'pets',
  'eco',
  'recycling',
  'compost',
  'yard',
  'grass',
  'nature',
  'beach_access',
  'pool',
  'hot_tub',
  'spa',
  'sports_basketball',
  'sports_tennis',
  'sports_volleyball',
  'sports_handball',
  'sports_hockey',
  'sports_rugby',
  'sports_football',
  'sports_baseball',
  'sports_golf',
  'sports_cricket',
  'sports_martial_arts',
  'sports_mma',
  'sports_kabaddi',
  'roller_skating',
  'ice_skating',
  'sledding',
  'paragliding',
  'downhill_skiing',
  'kitesurfing',
  'phishing',
  'vpn_lock',
  'gpp_good',
  'security',
  'admin_panel_settings',
  'trophy',
  'category',
  'topic',
  'difference',
  'merge',
  'commit',
  'rebase',
  'output',
  'input',
  'save',
  'save_alt',
  'open_in_new',
  'open_in_full',
  'fullscreen',
  'fullscreen_exit',
  'zoom_in',
  'zoom_out',
  'search',
  'manage_search',
  'find_replace',
  'find_in_page',
  'content_copy',
  'content_cut',
  'content_paste',
  'undo',
  'redo'
];

/** أقصى عدد خلايا للوحة (يتوافق مع game-setup) */
const BOARD_CELL_MAX = 36;

export interface HudCard {
  icon: string;
  accent: CardAccent;
  isFaceDown: boolean;
  isMatched: boolean;
}

export interface ConfettiPiece {
  leftPct: number;
  delayMs: number;
  durationMs: number;
  hue: number;
}

@Component({
  selector: 'app-tactical-dashboard',
  templateUrl: './tactical-dashboard.component.html',
  styleUrls: ['./tactical-dashboard.component.scss']
})
export class TacticalDashboardComponent implements OnDestroy {
  readonly cardBackSrc = 'assets/card-2.png';

  /** أبعاد الشبكة من صفحة الإعداد (أو 4×4 عند فتح /dashboard مباشرة) */
  boardRows = 4;
  boardCols = 4;

  cards: HudCard[] = [];

  private firstPickIndex: number | null = null;

  isResolvingMismatch = false;

  private flipBackTimer: ReturnType<typeof setTimeout> | null = null;

  private victoryDelayTimer: ReturnType<typeof setTimeout> | null = null;

  matchedPairs = 0;

  /** عدد المحاولات (كل كشف لزوج = 1) */
  movesCount = 0;

  gameWon = false;

  showVictoryOverlay = false;

  /** انتهى الوقت قبل إكمال الأزواج */
  gameLost = false;

  showGameOverOverlay = false;

  /** آخر زوج اتطابق — نؤخر شاشة الفوز عشان ما يحصلش Game Over في نفس اللحظة */
  private pendingVictory = false;

  confettiPieces: ConfettiPiece[] = [];

  /** حد المهمة بالثواني (من الإعداد) */
  missionTimeLimitSeconds = 60;

  /** نهاية العد التنازلي (epoch ms) */
  private missionDeadlineAt: number | null = null;

  /** يُحدَّث كل 100ms — للعرض والتحقق من انتهاء الوقت */
  countdownRemainingMs = 0;

  /** وقت بدء الجولة */
  private gameStartedAt = 0;

  /** يُحدَّث كل 100ms أثناء اللعب */
  elapsedMs = 0;

  private timerId: ReturnType<typeof setInterval> | null = null;

  /** لقطات نهائية للاحتفال */
  victoryElapsedMs = 0;

  victoryMoves = 0;

  victoryScore = 0;

  constructor(private readonly missionConfig: MissionConfigService) {
    this.restartGame();
  }

  ngOnDestroy(): void {
    this.clearFlipTimer();
    this.clearVictoryDelayTimer();
    this.stopWatch();
  }

  get totalPairs(): number {
    return Math.max(1, (this.boardRows * this.boardCols) / 2);
  }

  get matchCompletionPercent(): number {
    return Math.round((this.matchedPairs / this.totalPairs) * 100);
  }

  /** في عد تنازلي من إعداد المهمة */
  get missionHasTimeLimit(): boolean {
    return this.missionTimeLimitSeconds > 0;
  }

  /** نقاط حية أثناء اللعب */
  get liveScore(): number {
    const base = this.matchedPairs * 1550;
    const movePenalty = this.movesCount * 40;
    return Math.max(0, base - movePenalty + 500);
  }

  formatTime(ms: number): string {
    const safe = Math.max(0, ms);
    const totalCs = Math.floor(safe / 10);
    const cs = totalCs % 100;
    const totalS = Math.floor(totalCs / 100);
    const s = totalS % 60;
    const m = Math.floor(totalS / 60) % 99;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  }

  /** عرض العد التنازلي MM:SS */
  formatCountdown(ms: number): string {
    const safe = Math.max(0, ms);
    const totalS = Math.ceil(safe / 1000);
    const s = totalS % 60;
    const m = Math.floor(totalS / 60) % 99;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  restartGame(): void {
    this.applyMissionFromSnapshot();
    this.clearFlipTimer();
    this.clearVictoryDelayTimer();
    this.firstPickIndex = null;
    this.isResolvingMismatch = false;
    this.matchedPairs = 0;
    this.movesCount = 0;
    this.gameWon = false;
    this.gameLost = false;
    this.pendingVictory = false;
    this.showVictoryOverlay = false;
    this.showGameOverOverlay = false;
    this.confettiPieces = [];

    const pairCount = this.totalPairs;
    const icons = MEMORY_ICON_NAMES.slice(0, pairCount);
    const pairs: Pick<HudCard, 'icon' | 'accent'>[] = icons.map((icon, i) => ({
      icon,
      accent: i % 2 === 0 ? 'cyan' : 'orange'
    }));

    const deck: Pick<HudCard, 'icon' | 'accent'>[] = [];
    for (const p of pairs) {
      deck.push({ ...p });
      deck.push({ ...p });
    }
    this.shuffleInPlace(deck);

    this.cards = deck.map((d) => ({
      icon: d.icon,
      accent: d.accent,
      isFaceDown: true,
      isMatched: false
    }));

    this.gameStartedAt = Date.now();
    this.elapsedMs = 0;
    const limitMs = this.missionTimeLimitSeconds * 1000;
    this.missionDeadlineAt = limitMs > 0 ? this.gameStartedAt + limitMs : null;
    this.countdownRemainingMs = limitMs > 0 ? limitMs : 0;
    this.startWatch();
  }

  dismissVictory(): void {
    this.showVictoryOverlay = false;
  }

  dismissGameOver(): void {
    this.showGameOverOverlay = false;
  }

  onCardClick(i: number): void {
    if (this.gameWon || this.gameLost || this.showVictoryOverlay || this.showGameOverOverlay) {
      return;
    }
    if (this.isResolvingMismatch) {
      return;
    }
    const card = this.cards[i];
    if (card.isMatched) {
      return;
    }
    if (!card.isFaceDown) {
      return;
    }

    if (this.firstPickIndex === null) {
      card.isFaceDown = false;
      this.firstPickIndex = i;
      return;
    }

    if (this.firstPickIndex === i) {
      return;
    }

    const first = this.cards[this.firstPickIndex];
    card.isFaceDown = false;
    const secondIndex = i;

    this.movesCount += 1;

    if (first.icon === card.icon) {
      first.isMatched = true;
      card.isMatched = true;
      this.matchedPairs += 1;
      this.firstPickIndex = null;

      if (this.matchedPairs === this.totalPairs) {
        this.pendingVictory = true;
        this.clearVictoryDelayTimer();
        this.victoryDelayTimer = setTimeout(() => {
          this.beginVictoryCeremony();
          this.victoryDelayTimer = null;
        }, 550);
      }
      return;
    }

    this.isResolvingMismatch = true;
    const idxA = this.firstPickIndex;
    this.firstPickIndex = null;

    this.clearFlipTimer();
    this.flipBackTimer = setTimeout(() => {
      this.cards[idxA].isFaceDown = true;
      this.cards[secondIndex].isFaceDown = true;
      this.isResolvingMismatch = false;
      this.flipBackTimer = null;
    }, 850);
  }

  trackByIndex(index: number, _item: HudCard): number {
    return index;
  }

  trackByConfetti(i: number, _p: ConfettiPiece): number {
    return i;
  }

  private applyMissionFromSnapshot(): void {
    const snap = this.missionConfig.snapshot;
    let rows = 4;
    let cols = 4;
    if (snap && snap.rows > 0 && snap.cols > 0 && (snap.rows * snap.cols) % 2 === 0) {
      const clamped = this.clampBoardCellsToMax(snap.rows, snap.cols);
      rows = clamped.rows;
      cols = clamped.cols;
    }
    this.boardRows = rows;
    this.boardCols = cols;
    if (snap && snap.timeLimitSeconds > 0 && Number.isFinite(snap.timeLimitSeconds)) {
      this.missionTimeLimitSeconds = Math.floor(snap.timeLimitSeconds);
    } else {
      this.missionTimeLimitSeconds = 60;
    }
  }

  /** يقلّل الصفوف/الأعمدة لو المنتج > 36 مع الحفاظ على عدد خلايا زوجي */
  private clampBoardCellsToMax(rows: number, cols: number): { rows: number; cols: number } {
    let r = Math.min(Math.max(1, Math.floor(rows)), 12);
    let c = Math.min(Math.max(1, Math.floor(cols)), 12);
    while (r * c > BOARD_CELL_MAX) {
      if (r >= c) {
        r--;
      } else {
        c--;
      }
    }
    while (r > 0 && c > 0 && (r * c) % 2 === 1) {
      if (r >= c) {
        r--;
      } else {
        c--;
      }
    }
    if (r < 1 || c < 1) {
      return { rows: 4, cols: 4 };
    }
    return { rows: r, cols: c };
  }

  private beginVictoryCeremony(): void {
    this.pendingVictory = false;
    this.gameWon = true;
    this.stopWatch();
    this.victoryElapsedMs = Date.now() - this.gameStartedAt;
    this.victoryMoves = this.movesCount;
    this.victoryScore = this.computeFinalScore(this.victoryElapsedMs, this.victoryMoves);

    this.confettiPieces = Array.from({ length: 56 }, () => ({
      leftPct: Math.random() * 100,
      delayMs: Math.random() * 500,
      durationMs: 2000 + Math.random() * 1400,
      hue: Math.floor(Math.random() * 360)
    }));

    this.showVictoryOverlay = true;
  }

  private beginGameOver(): void {
    if (this.gameLost || this.gameWon || this.pendingVictory) {
      return;
    }
    this.clearFlipTimer();
    this.clearVictoryDelayTimer();
    this.gameLost = true;
    this.firstPickIndex = null;
    this.isResolvingMismatch = false;
    this.stopWatch();
    this.countdownRemainingMs = 0;
    this.showGameOverOverlay = true;
  }

  private computeFinalScore(ms: number, moves: number): number {
    const timeBonus = Math.max(0, Math.floor((180_000 - ms) / 120));
    const moveBonus = Math.max(0, 80 - moves) * 120;
    return Math.floor(8000 + this.totalPairs * 550 + timeBonus + moveBonus);
  }

  private startWatch(): void {
    this.stopWatch();
    this.timerId = setInterval(() => this.tickGameClock(), 100);
  }

  private tickGameClock(): void {
    if (this.gameWon || this.gameLost) {
      return;
    }
    const now = Date.now();
    this.elapsedMs = now - this.gameStartedAt;
    if (this.missionDeadlineAt !== null) {
      this.countdownRemainingMs = Math.max(0, this.missionDeadlineAt - now);
      if (
        this.countdownRemainingMs <= 0 &&
        !this.pendingVictory &&
        !this.showVictoryOverlay &&
        this.matchedPairs < this.totalPairs
      ) {
        this.beginGameOver();
      }
    }
  }

  private stopWatch(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private clearFlipTimer(): void {
    if (this.flipBackTimer !== null) {
      clearTimeout(this.flipBackTimer);
      this.flipBackTimer = null;
    }
  }

  private clearVictoryDelayTimer(): void {
    if (this.victoryDelayTimer !== null) {
      clearTimeout(this.victoryDelayTimer);
      this.victoryDelayTimer = null;
    }
  }

  private shuffleInPlace<T>(arr: T[]): void {
    for (let k = arr.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [arr[k], arr[j]] = [arr[j], arr[k]];
    }
  }
}
