import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeDashboard } from './employee-dashboard';
import { addIncomeSourcePopup } from './add-income-source-popup';

describe('EmployeeDashboard', () => {
  let component: EmployeeDashboard;
  let fixture: ComponentFixture<EmployeeDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeDashboard);

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
