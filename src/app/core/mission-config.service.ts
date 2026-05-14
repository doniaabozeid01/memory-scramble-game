import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/** فئات الكروت — لاعبين كرة قدم، حيوانات، شخصيات كرتونية */
export type MissionCategory = 'football' | 'animals' | 'cartoons';

export interface MissionConfig {
  rows: number;
  cols: number;
  timeLimitSeconds: number;
  playerName: string;
  category: MissionCategory;
}

const STORAGE_KEY = 'scramblix-mission-config';

@Injectable({
  providedIn: 'root'
})
export class MissionConfigService {
  private readonly _config$ = new BehaviorSubject<MissionConfig | null>(null);

  /** آخر إعدادات مسجّلة (أو null) — مناسب للـ async pipe */
  readonly config$ = this._config$.asObservable();

  constructor() {
    this.restoreFromStorage();
  }

  /** قراءة فورية بدون اشتراك */
  get snapshot(): MissionConfig | null {
    return this._config$.value;
  }

  /** تسجيل الإعدادات عند Start (يحدّث الـ stream و sessionStorage) */
  commit(config: MissionConfig): void {
    this._config$.next(config);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      /* ignore quota / private mode */
    }
  }

  private restoreFromStorage(): void {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as unknown;
      const normalized = this.normalizeMissionConfig(parsed);
      if (normalized) {
        this._config$.next(normalized);
      }
    } catch {
      /* ignore corrupt JSON */
    }
  }

  /** يقبل JSON قديم (بدون اسم/فئة) ويكمّل القيم الافتراضية */
  private normalizeMissionConfig(x: unknown): MissionConfig | null {
    if (!x || typeof x !== 'object') {
      return null;
    }
    const o = x as Record<string, unknown>;
    if (
      typeof o['rows'] !== 'number' ||
      typeof o['cols'] !== 'number' ||
      typeof o['timeLimitSeconds'] !== 'number' ||
      !Number.isFinite(o['rows']) ||
      !Number.isFinite(o['cols']) ||
      !Number.isFinite(o['timeLimitSeconds'])
    ) {
      return null;
    }
    const category = this.parseCategory(o['category']);
    const playerName = typeof o['playerName'] === 'string' ? o['playerName'].trim() : '';
    return {
      rows: Math.floor(o['rows']),
      cols: Math.floor(o['cols']),
      timeLimitSeconds: Math.floor(o['timeLimitSeconds']),
      playerName,
      category
    };
  }

  private parseCategory(v: unknown): MissionCategory {
    if (v === 'football' || v === 'animals' || v === 'cartoons') {
      return v;
    }
    return 'football';
  }
}
