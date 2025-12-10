import { ComponentFixture, TestBed } from '@angular/core/testing';
import { addIncomeProductPopup } from './add-income-product-popup';

describe('EditProfilePopup', () => {
  let component: addIncomeProductPopup;
  let fixture: ComponentFixture<addIncomeProductPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [addIncomeProductPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(addIncomeProductPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
