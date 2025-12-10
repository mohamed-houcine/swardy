import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeProductForm } from './employee-product-form';

describe('EmployeeProductForm', () => {
  let component: EmployeeProductForm;
  let fixture: ComponentFixture<EmployeeProductForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeProductForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeProductForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
