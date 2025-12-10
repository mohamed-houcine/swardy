import { ComponentFixture, TestBed } from '@angular/core/testing';
import { addExpenseNormalPopup } from './add-expense-normal-popup';

describe('EditProfilePopup', () => {
  let component: addExpenseNormalPopup;
  let fixture: ComponentFixture<addExpenseNormalPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [addExpenseNormalPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(addExpenseNormalPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
