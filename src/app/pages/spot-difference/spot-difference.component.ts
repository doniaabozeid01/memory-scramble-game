import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MissionConfigService } from '../../core/mission-config.service';

/** إحداثيات نسبية داخل نصف اللوحة (يسار/يمين) — الاختلافات كلها في الصورة اليمنى */
interface SpotDef {
  id: string;
  pane: 'left' | 'right';
  x: number;
  y: number;
  r: number;
}

const SPOTS: readonly SpotDef[] = [
  /* مراكز محاذاة للعناصر في .sd-scene (اليمين) — الدائرة تُرسَم على نفس مركز الضربة */
  { id: 'spark', pane: 'right', x: 91, y: 11, r: 9 },
  { id: 'crater', pane: 'right', x: 27, y: 28, r: 9 },
  { id: 'window', pane: 'right', x: 57, y: 73, r: 9 },
  { id: 'planet', pane: 'right', x: 87, y: 86, r: 9 },
  { id: 'horizon', pane: 'right', x: 48, y: 93, r: 9 }
];

@Component({
  selector: 'app-spot-difference',
  templateUrl: './spot-difference.component.html',
  styleUrls: ['./spot-difference.component.scss']
})
export class SpotDifferenceComponent implements OnInit, OnDestroy {
  @ViewChild('refScene') refScene?: ElementRef<HTMLElement>;
  @ViewChild('modScene') modScene?: ElementRef<HTMLElement>;

  readonly spots = SPOTS;

  readonly spotsRight = SPOTS.filter((s) => s.pane === 'right');

  readonly starSlots = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  playerName = '';

  missionTimeLimitSeconds = 90;

  private missionDeadlineAt: number | null = null;

  countdownRemainingMs = 0;

  private timerId: ReturnType<typeof setInterval> | null = null;

  foundIds = new Set<string>();

  /** مركز الدائرة = إحداثيات النقر داخل المشهد (تلاصق مع مكان الضغط) */
  markerAt: Partial<Record<string, { x: number; y: number }>> = {};

  gameWon = false;

  gameLost = false;

  wrongTaps = 0;

  constructor(
    private readonly missionConfig: MissionConfigService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const snap = this.missionConfig.snapshot;
    if (!snap || snap.gameMode !== 'spot_difference') {
      void this.router.navigateByUrl('/setup');
      return;
    }
    this.playerName = snap.playerName.trim();
    this.missionTimeLimitSeconds =
      snap.timeLimitSeconds > 0 && Number.isFinite(snap.timeLimitSeconds)
        ? Math.floor(snap.timeLimitSeconds)
        : 90;
    const limitMs = this.missionTimeLimitSeconds * 1000;
    this.missionDeadlineAt = limitMs > 0 ? Date.now() + limitMs : null;
    this.countdownRemainingMs = limitMs > 0 ? limitMs : 0;
    this.startClock();
  }

  ngOnDestroy(): void {
    this.stopClock();
  }

  get foundCount(): number {
    return this.foundIds.size;
  }

  get totalSpots(): number {
    return this.spots.length;
  }

  get progressPercent(): number {
    return Math.round((this.foundCount / Math.max(1, this.totalSpots)) * 100);
  }

  get missionHasTimeLimit(): boolean {
    return this.missionTimeLimitSeconds > 0;
  }

  formatCountdown(ms: number): string {
    const safe = Math.max(0, ms);
    const totalS = Math.ceil(safe / 1000);
    const s = totalS % 60;
    const m = Math.floor(totalS / 60) % 99;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  onPanesClick(ev: MouseEvent): void {
    if (this.gameWon || this.gameLost) {
      return;
    }
    const refEl = this.refScene?.nativeElement;
    const modEl = this.modScene?.nativeElement;
    if (!refEl || !modEl) {
      return;
    }
    const rRef = refEl.getBoundingClientRect();
    const rMod = modEl.getBoundingClientRect();
    const { clientX: cx, clientY: cy } = ev;
    let pane: 'left' | 'right' | null = null;
    let lx = 0;
    let ly = 0;
    if (cx >= rRef.left && cx <= rRef.right && cy >= rRef.top && cy <= rRef.bottom) {
      pane = 'left';
      lx = ((cx - rRef.left) / rRef.width) * 100;
      ly = ((cy - rRef.top) / rRef.height) * 100;
    } else if (cx >= rMod.left && cx <= rMod.right && cy >= rMod.top && cy <= rMod.bottom) {
      pane = 'right';
      lx = ((cx - rMod.left) / rMod.width) * 100;
      ly = ((cy - rMod.top) / rMod.height) * 100;
    } else {
      return;
    }
    for (const s of this.spots) {
      if (this.foundIds.has(s.id) || s.pane !== pane) {
        continue;
      }
      const d = Math.hypot(lx - s.x, ly - s.y);
      if (d <= s.r) {
        this.markerAt = { ...this.markerAt, [s.id]: { x: lx, y: ly } };
        this.foundIds = new Set([...this.foundIds, s.id]);
        if (this.foundIds.size >= this.spots.length) {
          this.win();
        }
        return;
      }
    }
    this.wrongTaps += 1;
  }

  restart(): void {
    this.stopClock();
    this.foundIds = new Set();
    this.markerAt = {};
    this.gameWon = false;
    this.gameLost = false;
    this.wrongTaps = 0;
    const limitMs = this.missionTimeLimitSeconds * 1000;
    this.missionDeadlineAt = limitMs > 0 ? Date.now() + limitMs : null;
    this.countdownRemainingMs = limitMs > 0 ? limitMs : 0;
    this.startClock();
  }

  exitToSetup(): void {
    void this.router.navigateByUrl('/setup');
  }

  private win(): void {
    this.gameWon = true;
    this.stopClock();
  }

  private lose(): void {
    this.gameLost = true;
    this.stopClock();
    this.countdownRemainingMs = 0;
  }

  private startClock(): void {
    this.stopClock();
    if (!this.missionDeadlineAt) {
      return;
    }
    this.timerId = setInterval(() => this.tick(), 200);
  }

  private stopClock(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private tick(): void {
    if (!this.missionDeadlineAt || this.gameWon || this.gameLost) {
      return;
    }
    const now = Date.now();
    this.countdownRemainingMs = Math.max(0, this.missionDeadlineAt - now);
    if (this.countdownRemainingMs <= 0) {
      this.lose();
    }
  }
}
