import { Component } from '@angular/core';
import { MissionConfigService } from '../../core/mission-config.service';

/**
 * صفحة مؤقتة: تعرض الإعدادات المحفوظة من الـ setup.
 * استبدلها بصفحة اللعبة الحقيقية واستخدم MissionConfigService هناك.
 */
@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.scss']
})
export class PlayComponent {
  constructor(readonly mission: MissionConfigService) {}
}
