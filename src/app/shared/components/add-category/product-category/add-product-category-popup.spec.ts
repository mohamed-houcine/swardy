import { ComponentFixture, TestBed } from '@angular/core/testing';
import { addProductCategoryPopup } from './add-product-category-popup';

describe('EditProfilePopup', () => {
  let component: addProductCategoryPopup;
  let fixture: ComponentFixture<addProductCategoryPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [addProductCategoryPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(addProductCategoryPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
