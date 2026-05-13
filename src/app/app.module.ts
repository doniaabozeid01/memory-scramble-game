import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SplashComponent } from './pages/splash/splash.component';
import { GameSetupComponent } from './pages/game-setup/game-setup.component';

@NgModule({
  declarations: [
    AppComponent,
    SplashComponent,
    GameSetupComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
