import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { OverviewChartComponent } from '../../shared/components/overview-chart/overview-chart';


@Component({
  selector: 'app-income',
  imports: [OverviewChartComponent],
  templateUrl: './income.html',
  styleUrl: './income.css',
})
export class Income implements OnInit {

  incomeOverview: any[] = [];
  loading = true;

  constructor(private dashboardService: DashboardService) {}

  async ngOnInit() {
    await this.loadIncomeOverview('monthly'); // default mode
  }

  async loadIncomeOverview(mode: 'weekly' | 'monthly' | 'yearly') {
    this.loading = true;
    this.incomeOverview = await this.dashboardService.getIncomeOverview(mode);
    this.loading = false;
  }
}