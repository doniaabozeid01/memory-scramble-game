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

  /** ثبات قصير بعد ظهور الحروف */
  private static readonly openAfterMs = 1400;

  /** يطابق مدة خروج الـ splash الهادئ ثم يفتح صفحة الإعداد */
  private static readonly navigateAfterOpenMs = 1200;

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.openTimer = setTimeout(() => {
      this.opening = true;
      this.navigateTimer = setTimeout(() => {
        void this.router.navigateByUrl('/setup');
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
