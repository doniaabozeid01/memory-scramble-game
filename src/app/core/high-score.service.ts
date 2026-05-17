import { Injectable } from '@angular/core';

/** إعدادات المهمة التي يُفصل عليها الرقم القياسي */
export interface HighScoreMissionKey {
  rows: number;
  cols: number;
  timeLimitSeconds: number;
}

export interface HighScoreRecord extends HighScoreMissionKey {
  score: number;
  elapsedMs: number;
  moves: number;
  playerName: string;
  achievedAt: number;
}

export interface HighScoreSubmitResult {
  isNewRecord: boolean;
  previousBest: number | null;
  record: HighScoreRecord;
}

const STORAGE_KEY = 'scramblix-high-scores';

@Injectable({
  providedIn: 'root'
})
export class HighScoreService {
  private cache: HighScoreRecord[] | null = null;

  /** مفتاح فريد لكل تركيبة: صفوف × أعمدة × حد الوقت */
  missionKey(rows: number, cols: number, timeLimitSeconds: number): string {
    return `${Math.floor(rows)}x${Math.floor(cols)}@${Math.floor(timeLimitSeconds)}s`;
  }

  /** حساب النقاط من حجم الشبكة + حد الوقت + الأداء (وقت اللعب + عدد الحركات) */
  computeScore(
    rows: number,
    cols: number,
    timeLimitSeconds: number,
    elapsedMs: number,
    moves: number
  ): number {
    const r = Math.max(1, Math.floor(rows));
    const c = Math.max(1, Math.floor(cols));
    const cells = r * c;
    const pairs = Math.max(1, cells / 2);
    const limitSec = Math.max(0, Math.floor(timeLimitSeconds));
    const safeElapsed = Math.max(0, Math.floor(elapsedMs));
    const safeMoves = Math.max(0, Math.floor(moves));

    const gridBase = cells * 120;
    const limitBase = limitSec * 45;

    const limitMs = limitSec > 0 ? limitSec * 1000 : 120_000;
    const timeRatio = Math.min(1, safeElapsed / limitMs);
    const timeBonus = Math.floor((1 - timeRatio) * (limitMs / 90));

    const idealMoves = pairs;
    const moveBonus =
      Math.max(0, idealMoves * 2 - safeMoves) * 90 + Math.max(0, idealMoves - safeMoves) * 180;

    return Math.floor(600 + gridBase + limitBase + timeBonus + moveBonus);
  }

  getBest(rows: number, cols: number, timeLimitSeconds: number): HighScoreRecord | null {
    const key = this.missionKey(rows, cols, timeLimitSeconds);
    const all = this.loadAll();
    let best: HighScoreRecord | null = null;
    for (const entry of all) {
      if (this.missionKey(entry.rows, entry.cols, entry.timeLimitSeconds) !== key) {
        continue;
      }
      if (!best || entry.score > best.score) {
        best = entry;
      }
    }
    return best;
  }

  getBestScore(rows: number, cols: number, timeLimitSeconds: number): number | null {
    const best = this.getBest(rows, cols, timeLimitSeconds);
    return best ? best.score : null;
  }

  /** يحفظ فقط إذا كان رقماً قياسياً جديداً لنفس الإعدادات */
  submit(record: Omit<HighScoreRecord, 'achievedAt'>): HighScoreSubmitResult {
    const previous = this.getBest(record.rows, record.cols, record.timeLimitSeconds);
    const previousBest = previous?.score ?? null;
    const full: HighScoreRecord = {
      ...record,
      achievedAt: Date.now()
    };

    let isNewRecord = false;
    if (previousBest === null || full.score > previousBest) {
      isNewRecord = true;
      const all = this.loadAll().filter(
        (e) =>
          this.missionKey(e.rows, e.cols, e.timeLimitSeconds) !==
          this.missionKey(record.rows, record.cols, record.timeLimitSeconds)
      );
      all.push(full);
      this.saveAll(all);
    }

    return {
      isNewRecord,
      previousBest,
      record: full
    };
  }

  formatMissionLabel(rows: number, cols: number, timeLimitSeconds: number): string {
    const t =
      timeLimitSeconds > 0
        ? `${timeLimitSeconds}s`
        : 'No limit';
    return `${rows}×${cols} · ${t}`;
  }

  private loadAll(): HighScoreRecord[] {
    if (this.cache) {
      return this.cache;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.cache = [];
        return this.cache;
      }
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        this.cache = [];
        return this.cache;
      }
      this.cache = parsed
        .map((x) => this.normalizeRecord(x))
        .filter((x): x is HighScoreRecord => x !== null);
      return this.cache;
    } catch {
      this.cache = [];
      return this.cache;
    }
  }

  private saveAll(records: HighScoreRecord[]): void {
    this.cache = records;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch {
      /* quota / private mode */
    }
  }

  private normalizeRecord(x: unknown): HighScoreRecord | null {
    if (!x || typeof x !== 'object') {
      return null;
    }
    const o = x as Record<string, unknown>;
    if (
      typeof o['rows'] !== 'number' ||
      typeof o['cols'] !== 'number' ||
      typeof o['timeLimitSeconds'] !== 'number' ||
      typeof o['score'] !== 'number' ||
      typeof o['elapsedMs'] !== 'number' ||
      typeof o['moves'] !== 'number'
    ) {
      return null;
    }
    return {
      rows: Math.floor(o['rows']),
      cols: Math.floor(o['cols']),
      timeLimitSeconds: Math.floor(o['timeLimitSeconds']),
      score: Math.floor(o['score']),
      elapsedMs: Math.floor(o['elapsedMs']),
      moves: Math.floor(o['moves']),
      playerName: typeof o['playerName'] === 'string' ? o['playerName'].trim() : '',
      achievedAt: typeof o['achievedAt'] === 'number' ? o['achievedAt'] : Date.now()
    };
  }
}
