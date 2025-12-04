import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { TotalComponent } from "../../shared/components/total-component/total-component";
import { NetBalanceComponent } from "../../shared/components/net-balance/net-balance";
import { GoalComponent } from "../../shared/components/goal-component/goal-component";
import { PieChartComponent } from "../../shared/components/pie-chart/pie-chart";
import { RecentTransactionComponent } from "../../shared/components/recent-transaction-component/recent-transaction-component";

@Component({
  selector: 'app-dashboard',
  imports: [TotalComponent, NetBalanceComponent, GoalComponent, PieChartComponent, RecentTransactionComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})

export class Dashboard implements OnInit {

  constructor(private dashboardService: DashboardService) {}

  name:string = "Mohamed";

  incomeLabels: string[] = [];
  incomeData: number[] = [];
  incomeColors: string[] = [];

  expenseLabels: string[] = [];
  expenseData: number[] = [];
  expenseColors: string[] = [];

  async ngOnInit() {
    await this.loadCategoryCharts();
  }

  async loadCategoryCharts() {
    const categories = await this.dashboardService.fetchCategories();
    const incomes = await this.dashboardService.fetchIncomes();
    const expenses = await this.dashboardService.fetchExpenses();

    // Income distribution
    const incomeDist = await this.dashboardService.categoryDistributionForIncomes(incomes, categories);
    this.incomeLabels = incomeDist.map(i => i.label);
    this.incomeData = incomeDist.map(i => i.value);
    this.incomeColors = incomeDist.map(i => i.color || '#999');

    // Expense distribution
    const expenseDist = await this.dashboardService.categoryDistributionForExpenses(expenses, categories);
    this.expenseLabels = expenseDist.map(i => i.label);
    this.expenseData = expenseDist.map(i => i.value);
    this.expenseColors = expenseDist.map(i => i.color || '#999');
  }
}