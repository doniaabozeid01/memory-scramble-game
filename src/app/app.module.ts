import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SplashComponent } from './pages/splash/splash.component';
import { GameSetupComponent } from './pages/game-setup/game-setup.component';
import { PlayComponent } from './pages/play/play.component';
import { TacticalDashboardComponent } from './pages/tactical-dashboard/tactical-dashboard.component';
import { SpotDifferenceComponent } from './pages/spot-difference/spot-difference.component';

@NgModule({
  declarations: [
    AppComponent,
    SplashComponent,
    GameSetupComponent,
    PlayComponent,
    TacticalDashboardComponent,
    SpotDifferenceComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
