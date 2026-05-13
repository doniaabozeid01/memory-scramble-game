import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameSetupComponent } from './game-setup.component';

describe('GameSetupComponent', () => {
  let component: GameSetupComponent;
  let fixture: ComponentFixture<GameSetupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GameSetupComponent]
    });
    fixture = TestBed.createComponent(GameSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
