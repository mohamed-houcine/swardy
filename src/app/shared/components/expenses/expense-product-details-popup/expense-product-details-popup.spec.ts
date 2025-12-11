import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenseProductDetailsPopup } from './expense-product-details-popup';

describe('ExpenseProductDetailsPopup', () => {
  let component: ExpenseProductDetailsPopup;
  let fixture: ComponentFixture<ExpenseProductDetailsPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseProductDetailsPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpenseProductDetailsPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
