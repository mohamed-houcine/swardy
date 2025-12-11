import { ComponentFixture, TestBed } from '@angular/core/testing';

import { addGoalPopup } from './add-goal-popup';

describe('addGoalPopup', () => {
  let component: addGoalPopup;
  let fixture: ComponentFixture<addGoalPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [addGoalPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(addGoalPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
