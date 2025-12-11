import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeProductDetailsPopup } from './income-product-details-popup';

describe('IncomeProductDetailsPopup', () => {
  let component: IncomeProductDetailsPopup;
  let fixture: ComponentFixture<IncomeProductDetailsPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomeProductDetailsPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeProductDetailsPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
