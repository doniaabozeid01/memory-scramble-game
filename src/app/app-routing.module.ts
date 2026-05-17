import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameSetupComponent } from './pages/game-setup/game-setup.component';
import { PlayComponent } from './pages/play/play.component';
import { SplashComponent } from './pages/splash/splash.component';
import { TacticalDashboardComponent } from './pages/tactical-dashboard/tactical-dashboard.component';
import { SpotDifferenceComponent } from './pages/spot-difference/spot-difference.component';

const routes: Routes = [
  { path: '', component: SplashComponent },
  { path: 'setup', component: GameSetupComponent },
  { path: 'game', component: GameSetupComponent },
  { path: 'play', component: PlayComponent },
  { path: 'spot-difference', component: SpotDifferenceComponent },
  { path: 'dashboard', component: TacticalDashboardComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
