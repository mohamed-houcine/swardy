import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NormalExpenseDeletePopup } from './normal-expense-delete-popup';

describe('NormalExpenseDeletePopup', () => {
  let component: NormalExpenseDeletePopup;
  let fixture: ComponentFixture<NormalExpenseDeletePopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NormalExpenseDeletePopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NormalExpenseDeletePopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
