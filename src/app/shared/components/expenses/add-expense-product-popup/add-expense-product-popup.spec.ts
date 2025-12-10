import { ComponentFixture, TestBed } from '@angular/core/testing';
import { addExpenseProductPopup } from './add-expense-product-popup';

describe('EditProfilePopup', () => {
  let component: addExpenseProductPopup;
  let fixture: ComponentFixture<addExpenseProductPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [addExpenseProductPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(addExpenseProductPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
