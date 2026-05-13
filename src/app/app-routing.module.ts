import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameSetupComponent } from './pages/game-setup/game-setup.component';
import { SplashComponent } from './pages/splash/splash.component';
import { TacticalDashboardComponent } from './pages/tactical-dashboard/tactical-dashboard.component';

const routes: Routes = [
  { path: '', component: SplashComponent },
  { path: 'game', component: GameSetupComponent },
  { path: 'setup', component: GameSetupComponent },
  { path: 'dashboard', component: TacticalDashboardComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
