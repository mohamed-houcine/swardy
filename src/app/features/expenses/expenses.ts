import { Component, OnInit } from '@angular/core';
import { OverviewChartComponent } from '../../shared/components/overview-chart/overview-chart';
import { DashboardService } from '../../services/dashboard.service';
import { CommonModule } from '@angular/common';
import { DataTable } from "../../shared/data-table/data-table";
import { TableColumn } from '../../shared/model/data-table/table-column.type';
import { Expense } from '../../shared/model/expense';

@Component({
  selector: 'app-expense',
  standalone: true,
  imports: [CommonModule, OverviewChartComponent, DataTable],
  templateUrl: './expenses.html',
  styleUrls: ['./expenses.css']
})
export class Expenses implements OnInit {

  overview: { date: string; amount: number }[] = [];
  mode: 'weekly' | 'monthly' | 'yearly' = 'monthly';

  ExpenseData: Expense[] = [];

  constructor(private dash: DashboardService) {}

  async ngOnInit() {
    this.overview = await this.dash.getExpenseOverview(this.mode);
    this.ExpenseData = await this.dash.fetchExpenses();
  }

  async onModeChange(m: 'weekly' | 'monthly' | 'yearly') {
    this.mode = m;
    this.overview = await this.dash.getExpenseOverview(m);
  }

  ExpenseColumnsNames: TableColumn[] = [
    { title: "Product", iconUrl: "assets/icons/product.svg", canBeSorted: true, key: "productName" },
    { title: "Quantity", iconUrl: "assets/icons/numbers.svg", canBeSorted: true, key: "quantity" },
    { title: "Employee", iconUrl: "assets/icons/employee.svg", canBeSorted: true, key: "employeeName" },
    { title: "Payment Method", iconUrl: "assets/icons/payment.svg", canBeSorted: true, key: "paymentMethod" },
    { title: "Amount ($)", iconUrl: "assets/icons/amount.svg", canBeSorted: true, key: "amount" },
    { title: "Date", iconUrl: "assets/icons/date.svg", canBeSorted: true, key: "date" },
    { title: "Actions", iconUrl: "assets/icons/actions.svg", canBeSorted: false, key: "" }
  ];

  ExpenseSearchFactors: string[] = ["productName", "employeeName"];
}
