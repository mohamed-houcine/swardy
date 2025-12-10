import { ComponentFixture, TestBed } from '@angular/core/testing';
import { addExpenseCategoryPopup } from './add-expense-category-popup';

describe('EditProfilePopup', () => {
  let component: addExpenseCategoryPopup;
  let fixture: ComponentFixture<addExpenseCategoryPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [addExpenseCategoryPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(addExpenseCategoryPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
