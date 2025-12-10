import { ComponentFixture, TestBed } from '@angular/core/testing';
import { addProductPopup } from './add-product-popup';

describe('EditProfilePopup', () => {
  let component: addProductPopup;
  let fixture: ComponentFixture<addProductPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [addProductPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(addProductPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
