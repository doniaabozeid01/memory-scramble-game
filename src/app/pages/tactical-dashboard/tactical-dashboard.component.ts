import { Component, OnDestroy } from '@angular/core';

export type CardAccent = 'cyan' | 'orange';

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
  readonly cardBackSrc = 'assets/card-back.png';

  readonly totalPairs = 8;

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

  confettiPieces: ConfettiPiece[] = [];

  /** وقت بدء الجولة */
  private gameStartedAt = 0;

  /** يُحدَّث كل 100ms أثناء اللعب */
  elapsedMs = 0;

  private timerId: ReturnType<typeof setInterval> | null = null;

  /** لقطات نهائية للاحتفال */
  victoryElapsedMs = 0;

  victoryMoves = 0;

  victoryScore = 0;

  constructor() {
    this.restartGame();
  }

  ngOnDestroy(): void {
    this.clearFlipTimer();
    this.clearVictoryDelayTimer();
    this.stopWatch();
  }

  get matchCompletionPercent(): number {
    return Math.round((this.matchedPairs / this.totalPairs) * 100);
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

  restartGame(): void {
    this.clearFlipTimer();
    this.clearVictoryDelayTimer();
    this.firstPickIndex = null;
    this.isResolvingMismatch = false;
    this.matchedPairs = 0;
    this.movesCount = 0;
    this.gameWon = false;
    this.showVictoryOverlay = false;
    this.confettiPieces = [];

    const pairs: Pick<HudCard, 'icon' | 'accent'>[] = [
      { icon: 'shield', accent: 'cyan' },
      { icon: 'military_tech', accent: 'orange' },
      { icon: 'bolt', accent: 'cyan' },
      { icon: 'token', accent: 'cyan' },
      { icon: 'box', accent: 'cyan' },
      { icon: 'radar', accent: 'orange' },
      { icon: 'crisis_alert', accent: 'orange' },
      { icon: 'terminal', accent: 'cyan' }
    ];

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
    this.startWatch();
  }

  dismissVictory(): void {
    this.showVictoryOverlay = false;
  }

  onCardClick(i: number): void {
    if (this.gameWon || this.showVictoryOverlay) {
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

  private beginVictoryCeremony(): void {
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

  private computeFinalScore(ms: number, moves: number): number {
    const timeBonus = Math.max(0, Math.floor((180_000 - ms) / 120));
    const moveBonus = Math.max(0, 80 - moves) * 120;
    return Math.floor(8000 + this.totalPairs * 550 + timeBonus + moveBonus);
  }

  private startWatch(): void {
    this.stopWatch();
    this.timerId = setInterval(() => {
      if (!this.gameWon) {
        this.elapsedMs = Date.now() - this.gameStartedAt;
      }
    }, 100);
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
