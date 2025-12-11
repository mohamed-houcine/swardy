import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeProductDeletePopup } from './income-product-delete-popup';

describe('IncomeProductDeletePopup', () => {
  let component: IncomeProductDeletePopup;
  let fixture: ComponentFixture<IncomeProductDeletePopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomeProductDeletePopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeProductDeletePopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
