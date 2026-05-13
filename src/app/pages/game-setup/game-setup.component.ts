import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MissionConfigService } from '../../core/mission-config.service';

/** أقصى صف أو عمود للشبكة */
const GRID_DIM_MAX = 12;

@Component({
  selector: 'app-game-setup',
  templateUrl: './game-setup.component.html',
  styleUrls: ['./game-setup.component.scss']
})
export class GameSetupComponent {
  readonly gridDimMax = GRID_DIM_MAX;

  readonly timeLimitChoices = [30, 60, 90, 120] as const;

  rows = 0;
  cols = 0;

  /** الوقت بالثواني للمهمة (واحد من القائمة) */
  timeLimitSeconds = 60;

  constructor(
    private readonly router: Router,
    private readonly missionConfig: MissionConfigService
  ) {}

  pad2(n: number): string {
    return Math.max(0, n).toString().padStart(2, '0');
  }

  selectTimeLimit(seconds: number): void {
    this.timeLimitSeconds = seconds;
  }

  startMission(): void {
    if (!this.canStartMission()) {
      return;
    }
    this.missionConfig.commit({
      rows: this.rows,
      cols: this.cols,
      timeLimitSeconds: this.timeLimitSeconds
    });
    void this.router.navigateByUrl('/play');
  }

  /** لازم صف وعمود على الأقل 1 عشان تبدأ المهمة */
  canStartMission(): boolean {
    return this.rows > 0 && this.cols > 0;
  }

  /** rows * cols زوجي: إما أحدهما 0، أو ما ينفعش الاتنين فردي وكلاهما > 0 */
  isValidPair(rows: number, cols: number): boolean {
    if (rows < 0 || cols < 0) {
      return false;
    }
    if (rows === 0 || cols === 0) {
      return true;
    }
    return (rows * cols) % 2 === 0;
  }

  incRows(): void {
    const n = this.nextValidRows(this.rows, this.cols);
    if (n !== this.rows) {
      this.rows = n;
    }
  }

  decRows(): void {
    const p = this.prevValidRows(this.rows, this.cols);
    if (p !== this.rows) {
      this.rows = p;
    }
  }

  incCols(): void {
    const n = this.nextValidCols(this.rows, this.cols);
    if (n !== this.cols) {
      this.cols = n;
    }
  }

  decCols(): void {
    const p = this.prevValidCols(this.rows, this.cols);
    if (p !== this.cols) {
      this.cols = p;
    }
  }

  canIncRows(): boolean {
    return this.nextValidRows(this.rows, this.cols) > this.rows;
  }

  canDecRows(): boolean {
    return this.prevValidRows(this.rows, this.cols) < this.rows;
  }

  canIncCols(): boolean {
    return this.nextValidCols(this.rows, this.cols) > this.cols;
  }

  canDecCols(): boolean {
    return this.prevValidCols(this.rows, this.cols) < this.cols;
  }

  private nextValidRows(rows: number, cols: number): number {
    for (let r = rows + 1; r <= GRID_DIM_MAX; r++) {
      if (this.isValidPair(r, cols)) {
        return r;
      }
    }
    return rows;
  }

  private prevValidRows(rows: number, cols: number): number {
    for (let r = rows - 1; r >= 0; r--) {
      if (this.isValidPair(r, cols)) {
        return r;
      }
    }
    return rows;
  }

  private nextValidCols(rows: number, cols: number): number {
    for (let c = cols + 1; c <= GRID_DIM_MAX; c++) {
      if (this.isValidPair(rows, c)) {
        return c;
      }
    }
    return cols;
  }

  private prevValidCols(rows: number, cols: number): number {
    for (let c = cols - 1; c >= 0; c--) {
      if (this.isValidPair(rows, c)) {
        return c;
      }
    }
    return cols;
  }
}
