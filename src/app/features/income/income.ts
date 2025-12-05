import { Component, OnInit } from '@angular/core';
import { OverviewChartComponent } from '../../shared/components/overview-chart/overview-chart';
import { DashboardService } from '../../services/dashboard.service';
import { CommonModule } from '@angular/common';
import { DataTable } from "../../shared/data-table/data-table";
import { TableColumn } from '../../shared/model/data-table/table-column.type';
import { IncomeModel } from '../../shared/model/income';

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
  IncomeData: IncomeModel[] = [];

  constructor(private dash: DashboardService) {}

  // ---------------------------------------------------
  //  INIT: load overview + income table from Supabase
  // ---------------------------------------------------
  async ngOnInit() {
    this.overview = await this.dash.getIncomeOverview(this.mode);
    this.IncomeData = await this.dash.fetchIncomes(); // 🔥 Supabase instead of static data
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
  IcomeColumnsNames: TableColumn[] = [
    {title: "Name", iconUrl: "assets/icons/name.svg", canBeSorted: true, key: "name"},
    {title: "Type", iconUrl: "assets/icons/type.svg", canBeSorted: true, key: "type"},
    {title: "Quantity", iconUrl: "assets/icons/numbers.svg", canBeSorted: true, key: "quantity"},
    {title: "Employee", iconUrl: "assets/icons/employee.svg", canBeSorted: true, key: "employeeName"},
    {title: "Payment Method", iconUrl: "assets/icons/payment.svg", canBeSorted: true, key: "paymentMethod"},
    {title: "Amount", iconUrl: "assets/icons/amount.svg", canBeSorted: true, key: "amount"},
    {title: "Date", iconUrl: "assets/icons/date.svg", canBeSorted: true, key: "date"},
    {title: "Actions", iconUrl: "assets/icons/actions.svg", canBeSorted: false, key: ""}
  ];

  IncomeSearchFactors: string[] = ["name", "employeeName"];
}
