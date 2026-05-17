import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'scramblix-theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly _theme$ = new BehaviorSubject<ThemeMode>('light');

  readonly theme$ = this._theme$.asObservable();

  constructor() {
    this.applyInitialTheme();
  }

  get snapshot(): ThemeMode {
    return this._theme$.value;
  }

  get isDark(): boolean {
    return this._theme$.value === 'dark';
  }

  toggle(): void {
    this.setTheme(this.isDark ? 'light' : 'dark');
  }

  setTheme(mode: ThemeMode): void {
    this._theme$.next(mode);
    const root = document.documentElement;
    root.classList.toggle('dark', mode === 'dark');
    root.setAttribute('data-theme', mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* private mode / quota */
    }
  }

  private applyInitialTheme(): void {
    let mode: ThemeMode = 'light';
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') {
        mode = stored;
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        mode = 'dark';
      }
    } catch {
      /* ignore */
    }
    this.setTheme(mode);
  }
}
