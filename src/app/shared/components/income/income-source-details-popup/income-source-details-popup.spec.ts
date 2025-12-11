import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeSourceDetailsPopup } from './income-source-details-popup';

describe('IncomeSourceDetailsPopup', () => {
  let component: IncomeSourceDetailsPopup;
  let fixture: ComponentFixture<IncomeSourceDetailsPopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomeSourceDetailsPopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeSourceDetailsPopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
