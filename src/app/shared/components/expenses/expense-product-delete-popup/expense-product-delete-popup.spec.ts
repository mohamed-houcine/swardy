import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseProductDeletePopup } from './expense-product-delete-popup';

describe('ExpenseProductDeletePopup', () => {
  let component: ExpenseProductDeletePopup;
  let fixture: ComponentFixture<ExpenseProductDeletePopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseProductDeletePopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseProductDeletePopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
