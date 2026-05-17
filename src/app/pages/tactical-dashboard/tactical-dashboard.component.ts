import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MissionCategory, MissionConfigService } from '../../core/mission-config.service';

export type CardAccent = 'cyan' | 'orange';

/** مسارات وجه الكرت لكل فئة (مجلد `cartoon` يطابق `MissionCategory` = cartoons) */
const CATEGORY_FACE_POOLS: Record<MissionCategory, readonly string[]> = {
  football: Array.from({ length: 18 }, (_, i) => `assets/football/${i + 1}.jpg`),
  animals: Array.from({ length: 18 }, (_, i) => `assets/animals/${i + 1}.jpg`),
  cartoons: [
    'assets/cartoon/1.jpg',
    'assets/cartoon/2.png',
    'assets/cartoon/3.jpg',
    'assets/cartoon/4.jpg',
    'assets/cartoon/5.jpg',
    'assets/cartoon/6.jpg',
    'assets/cartoon/7.jpg',
    'assets/cartoon/8.jpg',
    'assets/cartoon/9.jpg',
    'assets/cartoon/10.jpg',
    'assets/cartoon/11.jpg',
    'assets/cartoon/12.jpg',
    'assets/cartoon/13.jpg',
    'assets/cartoon/14.jpg',
    'assets/cartoon/15.jpg',
    'assets/cartoon/16.jpg',
    'assets/cartoon/17.jpg',
    'assets/cartoon/18.jpg'
  ]
};


/** أقصى عدد خلايا للوحة (يتوافق مع game-setup) */
const BOARD_CELL_MAX = 36;

/** بداية الجولة: كل الوجوه ظاهرة ثم إغلاق عشوائي متتابع */
const DEAL_INTRO_HOLD_MS = 1000;
const DEAL_INTRO_FLIP_STAGGER_MS = 45;
const DEAL_INTRO_END_BUFFER_MS = 560;

/** يبدأ صوت التحذير عند بقاء ≤ هذا الوقت (ms) */
const COUNTDOWN_TICK_START_MS = 10_000;

export interface HudCard {
  faceImageSrc: string;
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

  /** صوت ticks عند آخر 10 ثوانٍ (يُعاد تكراره حتى الفوز أو انتهاء الوقت) */
  private readonly countdownTickSrc = 'assets/countdown-ticks.mp3';

  private tickAudio: HTMLAudioElement | null = null;

  /** صوت الفوز (مرة واحدة عند إكمال الأزواج) */
  private readonly victorySoundSrc = 'assets/victory-win.mp3';

  private victoryAudio: HTMLAudioElement | null = null;

  /** صوت Game Over (negative beeps) */
  private readonly gameOverSoundSrc = 'assets/game-over-beeps.mp3';

  private gameOverAudio: HTMLAudioElement | null = null;

  /** من إعداد المهمة — للعرض في السايدبار */
  missionPlayerDisplay = '';

  missionCategoryDisplay = '';

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

  /** مرحلة الذاكرة: الكروت مكشوفة ثم تُقلب — لا نقرأ النقرات */
  isDealIntroActive = false;

  private introHoldTimer: ReturnType<typeof setTimeout> | null = null;

  private introFlipTimers: ReturnType<typeof setTimeout>[] = [];

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

  constructor(
    private readonly missionConfig: MissionConfigService,
    private readonly router: Router
  ) {
    this.restartGame();
  }

  ngOnDestroy(): void {
    this.clearFlipTimer();
    this.clearVictoryDelayTimer();
    this.clearIntroTimers();
    this.stopWatch();
    this.stopCountdownTickSound();
    this.stopVictorySound();
    this.stopGameOverSound();
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
    const snap = this.missionConfig.snapshot;
    if (snap?.gameMode === 'spot_difference') {
      void this.router.navigateByUrl('/spot-difference');
      return;
    }
    this.stopCountdownTickSound();
    this.stopVictorySound();
    this.stopGameOverSound();
    this.clearIntroTimers();
    this.applyMissionFromSnapshot();
    this.clearFlipTimer();
    this.clearVictoryDelayTimer();
    this.stopWatch();
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
    const pool = [...this.getCategoryFaceImagePool()];
    this.shuffleInPlace(pool);
    const chosen = pool.slice(0, Math.min(pairCount, pool.length));
    while (chosen.length < pairCount && pool.length > 0) {
      chosen.push(pool[chosen.length % pool.length]);
    }

    const deck: Pick<HudCard, 'faceImageSrc' | 'accent'>[] = [];
    for (let p = 0; p < pairCount; p++) {
      const faceImageSrc = chosen[p];
      const accent: CardAccent = p % 2 === 0 ? 'cyan' : 'orange';
      deck.push({ faceImageSrc, accent });
      deck.push({ faceImageSrc, accent });
    }
    this.shuffleInPlace(deck);

    this.cards = deck.map((d) => ({
      faceImageSrc: d.faceImageSrc,
      accent: d.accent,
      isFaceDown: false,
      isMatched: false
    }));

    this.gameStartedAt = 0;
    this.elapsedMs = 0;
    const limitMs = this.missionTimeLimitSeconds * 1000;
    this.missionDeadlineAt = null;
    this.countdownRemainingMs = limitMs > 0 ? limitMs : 0;

    this.beginMemoryIntro();
  }

  dismissVictory(): void {
    this.showVictoryOverlay = false;
  }

  dismissGameOver(): void {
    this.showGameOverOverlay = false;
  }

  onCardClick(i: number): void {
    if (this.isDealIntroActive) {
      return;
    }
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

    if (first.faceImageSrc === card.faceImageSrc) {
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
    this.missionPlayerDisplay = snap?.playerName?.trim() ?? '';
    this.missionCategoryDisplay = snap ? this.categoryLabelAr(snap.category) : '';
  }

  private getCategoryFaceImagePool(): readonly string[] {
    const cat = this.missionConfig.snapshot?.category ?? 'football';
    return CATEGORY_FACE_POOLS[cat];
  }

  private categoryLabelAr(c: MissionCategory): string {
    const labels: Record<MissionCategory, string> = {
      football: 'لاعبين كرة قدم',
      animals: 'حيوانات',
      cartoons: 'شخصيات كرتونية'
    };
    return labels[c];
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
    this.stopCountdownTickSound();
    this.stopGameOverSound();
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
    this.playVictorySound();
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
    this.stopCountdownTickSound();
    this.stopVictorySound();
    this.stopWatch();
    this.countdownRemainingMs = 0;
    this.showGameOverOverlay = true;
    this.playGameOverSound();
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
    if (this.isDealIntroActive) {
      return;
    }
    if (this.gameWon || this.gameLost) {
      return;
    }
    const now = Date.now();
    this.elapsedMs = now - this.gameStartedAt;
    if (this.missionDeadlineAt !== null) {
      this.countdownRemainingMs = Math.max(0, this.missionDeadlineAt - now);
      this.syncCountdownTickAudio();
      if (
        this.countdownRemainingMs <= 0 &&
        !this.pendingVictory &&
        !this.showVictoryOverlay &&
        this.matchedPairs < this.totalPairs
      ) {
        this.beginGameOver();
      }
    } else {
      this.syncCountdownTickAudio();
    }
  }

  /** تشغيل صوت الـ ticks في آخر 10 ثوانٍ؛ يتوقف عند الفوز أو الخسارة أو إعادة الجولة */
  private syncCountdownTickAudio(): void {
    const shouldPlay =
      !this.isDealIntroActive &&
      this.missionDeadlineAt !== null &&
      !this.gameWon &&
      !this.gameLost &&
      !this.pendingVictory &&
      !this.showVictoryOverlay &&
      !this.showGameOverOverlay &&
      this.countdownRemainingMs > 0 &&
      this.countdownRemainingMs <= COUNTDOWN_TICK_START_MS;

    if (shouldPlay) {
      this.startCountdownTickSound();
    } else {
      this.stopCountdownTickSound();
    }
  }

  private startCountdownTickSound(): void {
    if (typeof Audio === 'undefined') {
      return;
    }
    if (!this.tickAudio) {
      this.tickAudio = new Audio(this.countdownTickSrc);
      this.tickAudio.loop = true;
      this.tickAudio.preload = 'auto';
    }
    if (this.tickAudio.paused) {
      void this.tickAudio.play().catch(() => {
        /* سياسات autoplay في المتصفح */
      });
    }
  }

  private stopCountdownTickSound(): void {
    if (this.tickAudio) {
      this.tickAudio.pause();
      this.tickAudio.currentTime = 0;
    }
  }

  private playVictorySound(): void {
    if (typeof Audio === 'undefined') {
      return;
    }
    if (!this.victoryAudio) {
      this.victoryAudio = new Audio(this.victorySoundSrc);
      this.victoryAudio.loop = false;
      this.victoryAudio.preload = 'auto';
    }
    this.victoryAudio.currentTime = 0;
    void this.victoryAudio.play().catch(() => {
      /* سياسات autoplay في المتصفح */
    });
  }

  private stopVictorySound(): void {
    if (this.victoryAudio) {
      this.victoryAudio.pause();
      this.victoryAudio.currentTime = 0;
    }
  }

  private playGameOverSound(): void {
    if (typeof Audio === 'undefined') {
      return;
    }
    if (!this.gameOverAudio) {
      this.gameOverAudio = new Audio(this.gameOverSoundSrc);
      this.gameOverAudio.loop = false;
      this.gameOverAudio.preload = 'auto';
    }
    this.gameOverAudio.currentTime = 0;
    void this.gameOverAudio.play().catch(() => {
      /* سياسات autoplay في المتصفح */
    });
  }

  private stopGameOverSound(): void {
    if (this.gameOverAudio) {
      this.gameOverAudio.pause();
      this.gameOverAudio.currentTime = 0;
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

  private clearIntroTimers(): void {
    if (this.introHoldTimer !== null) {
      clearTimeout(this.introHoldTimer);
      this.introHoldTimer = null;
    }
    for (const t of this.introFlipTimers) {
      clearTimeout(t);
    }
    this.introFlipTimers = [];
  }

  /** كل الكروت ظاهرة → بعد 1s تقلب عشوائيًا واحدة ورا التانية (سريع) */
  private beginMemoryIntro(): void {
    const n = this.cards.length;
    if (n === 0) {
      this.isDealIntroActive = false;
      this.finishDealIntro();
      return;
    }
    this.isDealIntroActive = true;
    this.introHoldTimer = setTimeout(() => {
      this.introHoldTimer = null;
      const order = Array.from({ length: n }, (_, i) => i);
      this.shuffleInPlace(order);
      for (let step = 0; step < n; step++) {
        const cardIndex = order[step];
        const id = setTimeout(() => {
          this.cards[cardIndex].isFaceDown = true;
        }, step * DEAL_INTRO_FLIP_STAGGER_MS);
        this.introFlipTimers.push(id);
      }
      const flipSpan = Math.max(0, n - 1) * DEAL_INTRO_FLIP_STAGGER_MS + DEAL_INTRO_END_BUFFER_MS;
      const fin = setTimeout(() => this.finishDealIntro(), flipSpan);
      this.introFlipTimers.push(fin);
    }, DEAL_INTRO_HOLD_MS);
  }

  private finishDealIntro(): void {
    this.clearIntroTimers();
    this.isDealIntroActive = false;
    this.gameStartedAt = Date.now();
    const limitMs = this.missionTimeLimitSeconds * 1000;
    this.missionDeadlineAt = limitMs > 0 ? this.gameStartedAt + limitMs : null;
    this.countdownRemainingMs = limitMs > 0 ? limitMs : 0;
    this.startWatch();
  }
}
