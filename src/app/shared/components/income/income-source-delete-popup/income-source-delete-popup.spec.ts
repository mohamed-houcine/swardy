import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeSourceDeletePopup } from './income-source-delete-popup';

describe('IncomeSourceDeletePopup', () => {
  let component: IncomeSourceDeletePopup;
  let fixture: ComponentFixture<IncomeSourceDeletePopup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncomeSourceDeletePopup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeSourceDeletePopup);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
