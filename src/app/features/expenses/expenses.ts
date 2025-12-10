import { Component, OnInit } from '@angular/core';
import { OverviewChartComponent } from '../../shared/components/overview-chart/overview-chart';
import { DashboardService } from '../../services/dashboard.service';
import { CommonModule } from '@angular/common';
import { TableColumn } from '../../shared/model/data-table/table-column.type';
import { DataTable } from '../../shared/components/data-table/data-table';
import { NormalExpense } from '../../shared/model/normal_expense';
import { ProductExpense } from '../../shared/model/product_expense';

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

  NormalExpensesData: NormalExpense[] = [];
  ProductExpensesData: ProductExpense[] = [];

  constructor(private dash: DashboardService) {}

  async ngOnInit() {
    this.overview = await this.dash.getExpenseOverview(this.mode);
    this.NormalExpensesData = await this.dash.fetchNormalExpenses();
    this.ProductExpensesData = await this.dash.fetchProductExpenses();
  }

  async onModeChange(m: 'weekly' | 'monthly' | 'yearly') {
    this.mode = m;
    this.overview = await this.dash.getExpenseOverview(m);
  }

  NormalExpensesColumnsNames: TableColumn[] = [
    { title: "Name", iconUrl: "assets/icons/data-table/name.svg", canBeSorted: true, key: "name" },
    { title: "Category", iconUrl: "assets/icons/data-table/numbers.svg", canBeSorted: true, key: "category" },
    { title: "Amount ($)", iconUrl: "assets/icons/data-table/amount.svg", canBeSorted: true, key: "amount" },
    { title: "Date", iconUrl: "assets/icons/data-table/date.svg", canBeSorted: true, key: "date" },
    {title: "Actions", iconUrl: "assets/icons/data-table/actions.svg", canBeSorted: false, key: ""}
  ];

  ProductExpensesColumnsNames: TableColumn[] = [
    { title: "Product Name", iconUrl: "assets/icons/data-table/name.svg", canBeSorted: true, key: 'productName'},
    { title: "Category", iconUrl: "assets/icons/data-table/category.svg", canBeSorted: true, key: 'category'},
    { title: "Quantity", iconUrl: "assets/icons/data-table/numbers.svg", canBeSorted: true, key: 'quantity'},
    { title: "Amount ($)", iconUrl: "assets/icons/data-table/amount.svg", canBeSorted: true, key: 'amount'},
    { title: "Date", iconUrl: "assets/icons/data-table/date.svg", canBeSorted: true, key: 'date'},
    {title: "Actions", iconUrl: "assets/icons/data-table/actions.svg", canBeSorted: false, key: ""}
  ];

  NormalExpensesSearchFactors: string[] = ["name", "category"];
  ProductExpensesSearchFactors: string[] = ["productName", "category"];
}
