import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameSetupComponent } from './pages/game-setup/game-setup.component';
import { SplashComponent } from './pages/splash/splash.component';

const routes: Routes = [
  { path: '', component: GameSetupComponent },
  { path: 'setup', component: GameSetupComponent }

  { path: '', component: SplashComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
