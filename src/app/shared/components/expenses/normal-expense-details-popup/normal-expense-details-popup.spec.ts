import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NormalExpenseDetailsPopup } from './normal-expense-details-popup';

describe('NormalExpenseDetailsPopup', () => {
  let component: NormalExpenseDetailsPopup;
  let fixture: ComponentFixture<NormalExpenseDetailsPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NormalExpenseDetailsPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NormalExpenseDetailsPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});