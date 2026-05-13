import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface MissionConfig {
  rows: number;
  cols: number;
  timeLimitSeconds: number;
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
      if (!this.isMissionConfig(parsed)) {
        return;
      }
      this._config$.next(parsed);
    } catch {
      /* ignore corrupt JSON */
    }
  }

  private isMissionConfig(x: unknown): x is MissionConfig {
    if (!x || typeof x !== 'object') {
      return false;
    }
    const o = x as Record<string, unknown>;
    return (
      typeof o['rows'] === 'number' &&
      typeof o['cols'] === 'number' &&
      typeof o['timeLimitSeconds'] === 'number' &&
      Number.isFinite(o['rows']) &&
      Number.isFinite(o['cols']) &&
      Number.isFinite(o['timeLimitSeconds'])
    );
  }
}
