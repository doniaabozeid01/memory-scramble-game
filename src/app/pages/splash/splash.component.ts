import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent implements OnInit, OnDestroy {
  readonly brandLetters = [...'SCRAMBLIX'];

  opening = false;

  private openTimer: ReturnType<typeof setTimeout> | null = null;
  private navigateTimer: ReturnType<typeof setTimeout> | null = null;

  /** بعد ظهور الحروف يبدأ انيميشن الفتح */
  private static readonly openAfterMs = 1180;
  /** بعد انتهاء تقريبي لوميض الفتح → الانتقال لصفحة اللعبة */
  private static readonly navigateAfterOpenMs = 1000;

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.openTimer = setTimeout(() => {
      this.opening = true;
      this.navigateTimer = setTimeout(() => {
        void this.router.navigateByUrl('/game');
      }, SplashComponent.navigateAfterOpenMs);
    }, SplashComponent.openAfterMs);
  }

  ngOnDestroy(): void {
    if (this.openTimer) {
      clearTimeout(this.openTimer);
    }
    if (this.navigateTimer) {
      clearTimeout(this.navigateTimer);
    }
  }
}
