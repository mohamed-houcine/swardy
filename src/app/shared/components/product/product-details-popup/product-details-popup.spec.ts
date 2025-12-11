import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductDetailsPopup } from './product-details-popup';

describe('ProductDetailsPopup', () => {
  let component: ProductDetailsPopup;
  let fixture: ComponentFixture<ProductDetailsPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDetailsPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductDetailsPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
