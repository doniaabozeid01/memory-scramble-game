import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameSetupComponent } from './pages/game-setup/game-setup.component';
import { PlayComponent } from './pages/play/play.component';
import { SplashComponent } from './pages/splash/splash.component';

const routes: Routes = [
  { path: '', component: SplashComponent },
  { path: 'setup', component: GameSetupComponent },
  { path: 'play', component: PlayComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
