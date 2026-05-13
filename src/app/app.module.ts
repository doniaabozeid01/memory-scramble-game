import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SplashComponent } from './pages/splash/splash.component';
import { GameSetupComponent } from './pages/game-setup/game-setup.component';
import { PlayComponent } from './pages/play/play.component';
import { TacticalDashboardComponent } from './pages/tactical-dashboard/tactical-dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    SplashComponent,
    GameSetupComponent,
    PlayComponent
    TacticalDashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
