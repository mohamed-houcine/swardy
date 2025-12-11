import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductDeletePopup } from './product-delete-popup';

describe('ProductDeletePopup', () => {
  let component: ProductDeletePopup;
  let fixture: ComponentFixture<ProductDeletePopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDeletePopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductDeletePopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
