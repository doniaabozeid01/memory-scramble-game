import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MissionCategory, MissionConfigService } from '../../core/mission-config.service';

/** أقصى صف أو عمود للشبكة */
const GRID_DIM_MAX = 12;

/** أقصى عدد خلايا للوحة (صفوف × أعمدة) */
const BOARD_CELL_MAX = 36;

export interface CategoryOption {
  id: MissionCategory;
  label: string;
}

@Component({
  selector: 'app-game-setup',
  templateUrl: './game-setup.component.html',
  styleUrls: ['./game-setup.component.scss']
})
export class GameSetupComponent {
  readonly gridDimMax = GRID_DIM_MAX;

  readonly boardCellMax = BOARD_CELL_MAX;

  readonly timeLimitChoices = [30, 60, 90, 120] as const;

  readonly categoryOptions: CategoryOption[] = [
    { id: 'football', label: 'Football players' },
    { id: 'animals', label: 'Animals' },
    { id: 'cartoons', label: 'Cartoon characters' }
  ];

  rows = 0;
  cols = 0;

  /** الوقت بالثواني للمهمة (واحد من القائمة) */
  timeLimitSeconds = 60;

  /** اسم اللاعب — مطلوب قبل البدء */
  playerName = '';

  /** فئة الكروت — مطلوبة قبل البدء */
  selectedCategory: MissionCategory | null = null;

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

  selectCategory(id: MissionCategory): void {
    this.selectedCategory = id;
  }

  startMission(): void {
    if (!this.canStartMission() || this.selectedCategory === null) {
      return;
    }
    const name = this.playerName.trim();
    this.missionConfig.commit({
      rows: this.rows,
      cols: this.cols,
      timeLimitSeconds: this.timeLimitSeconds,
      playerName: name,
      category: this.selectedCategory
    });
    void this.router.navigateByUrl('/dashboard');
  }

  /** شبكة صالحة + اسم غير فارغ + فئة مختارة */
  canStartMission(): boolean {
    return (
      this.rows > 0 &&
      this.cols > 0 &&
      this.playerName.trim().length > 0 &&
      this.selectedCategory !== null
    );
  }

  /** rows * cols زوجي: إما أحدهما 0، أو ما ينفعش الاتنين فردي وكلاهما > 0 */
  isValidPair(rows: number, cols: number): boolean {
    if (rows < 0 || cols < 0) {
      return false;
    }
    if (rows === 0 || cols === 0) {
      return true;
    }
    if (rows * cols > BOARD_CELL_MAX) {
      return false;
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
    const rMax =
      cols > 0 ? Math.min(GRID_DIM_MAX, Math.floor(BOARD_CELL_MAX / cols)) : GRID_DIM_MAX;
    for (let r = rows + 1; r <= rMax; r++) {
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
    const cMax =
      rows > 0 ? Math.min(GRID_DIM_MAX, Math.floor(BOARD_CELL_MAX / rows)) : GRID_DIM_MAX;
    for (let c = cols + 1; c <= cMax; c++) {
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
