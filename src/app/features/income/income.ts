import { Component, OnInit } from '@angular/core';
import { OverviewChartComponent } from '../../shared/components/overview-chart/overview-chart';
import { DashboardService } from '../../services/dashboard.service';
import { CommonModule } from '@angular/common';
import { DataTable } from "../../shared/components/data-table/data-table";
import { TableColumn } from '../../shared/model/data-table/table-column.type';
import { IncomeSource } from '../../shared/model/income_source';
import { IncomeProduct } from '../../shared/model/income_product';

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [CommonModule, OverviewChartComponent, DataTable],
  templateUrl: './income.html',
  styleUrls: ['./income.css']
})
export class Income implements OnInit {

  overview: { date: string; amount: number }[] = [];
  mode: 'weekly' | 'monthly' | 'yearly' = 'monthly';

  // Income table
  IncomeSourceData: IncomeSource[] = [];
  IncomeProductData: IncomeProduct[] = [];

  constructor(private dash: DashboardService) {}

  // ---------------------------------------------------
  //  INIT: load overview + income table from Supabase
  // ---------------------------------------------------
  async ngOnInit() {
    this.overview = await this.dash.getIncomeOverview(this.mode);
    this.IncomeSourceData = await this.dash.fetchIncomeSources();
    this.IncomeProductData = await this.dash.fetchIncomeProducts();
  }

  // ---------------------------------------------------
  //  When dropdown mode changes
  // ---------------------------------------------------
  async onModeChange(m: 'weekly' | 'monthly' | 'yearly') {
    this.mode = m;
    this.overview = await this.dash.getIncomeOverview(m);
  }

  // ---------------------------------------------------
  //  DataTable configuration
  // ---------------------------------------------------
  IncomeSourceColumnsNames: TableColumn[] = [
    {title: "Name", iconUrl: "assets/icons/data-table/name.svg", canBeSorted: true, key: "name"},
    {title: "Category", iconUrl: "assets/icons/data-table/name.svg", canBeSorted: true, key: "category"},
    {title: "Amount", iconUrl: "assets/icons/data-table/amount.svg", canBeSorted: true, key: "amount"},
    {title: "Date", iconUrl: "assets/icons/data-table/date.svg", canBeSorted: true, key: "date"},
    {title: "Actions", iconUrl: "assets/icons/data-table/actions.svg", canBeSorted: false, key: ""}
  ];

  IncomeProductColumnsNames: TableColumn[] = [
    {title: "Name", iconUrl: "assets/icons/data-table/name.svg", canBeSorted: true, key: "product"},
    {title: "Category", iconUrl: "assets/icons/data-table/name.svg", canBeSorted: true, key: "category"},
    {title: "Quantity", iconUrl: "assets/icons/data-table/numbers.svg", canBeSorted: true, key: "quantity"},
    {title: "Amount", iconUrl: "assets/icons/data-table/amount.svg", canBeSorted: true, key: "amount"},
    {title: "Employee", iconUrl: "assets/icons/data-table/employee.svg", canBeSorted: true, key: "employeeName"},
    {title: "Payment Method", iconUrl: "assets/icons/data-table/payment.svg", canBeSorted: true, key: "paymentMethod"},
    {title: "Date", iconUrl: "assets/icons/data-table/date.svg", canBeSorted: true, key: "date"},
    {title: "Actions", iconUrl: "assets/icons/data-table/actions.svg", canBeSorted: false, key: ""}
  ];

  IncomeSourceSearchFactors: string[] = ["name", "category"];
  IncomeProductSearchFactors: string[] = ["name", "category", "employeeName"];
}
