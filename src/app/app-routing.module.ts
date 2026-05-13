import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameSetupComponent } from './pages/game-setup/game-setup.component';

const routes: Routes = [
  { path: '', component: GameSetupComponent },
  { path: 'setup', component: GameSetupComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
