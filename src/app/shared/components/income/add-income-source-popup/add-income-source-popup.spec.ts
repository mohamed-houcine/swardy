import { ComponentFixture, TestBed } from '@angular/core/testing';
import { addIncomeSourcePopup } from './add-income-source-popup';

describe('EditProfilePopup', () => {
  let component: addIncomeSourcePopup;
  let fixture: ComponentFixture<addIncomeSourcePopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [addIncomeSourcePopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(addIncomeSourcePopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
