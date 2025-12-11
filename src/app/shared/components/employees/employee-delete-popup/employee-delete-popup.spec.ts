import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDeletePopup } from './employee-delete-popup';

describe('EmployeeDeletePopup', () => {
  let component: EmployeeDeletePopup;
  let fixture: ComponentFixture<EmployeeDeletePopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeDeletePopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeDeletePopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
