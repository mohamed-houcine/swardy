import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeProductFormComponent } from './employee-product-form';

describe('EmployeeProductFormComponent', () => {
  let component: EmployeeProductFormComponent;
  let fixture: ComponentFixture<EmployeeProductFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeProductFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeProductFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
