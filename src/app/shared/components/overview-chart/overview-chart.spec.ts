import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverviewChart } from './overview-chart';

describe('OverviewChart', () => {
  let component: OverviewChart;
  let fixture: ComponentFixture<OverviewChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverviewChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OverviewChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
