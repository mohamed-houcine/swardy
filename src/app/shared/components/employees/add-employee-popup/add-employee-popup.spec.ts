import { ComponentFixture, TestBed } from '@angular/core/testing';
import { addEmployeePopup } from './add-employee-popup';

describe('EditProfilePopup', () => {
  let component: addEmployeePopup;
  let fixture: ComponentFixture<addEmployeePopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [addEmployeePopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(addEmployeePopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
