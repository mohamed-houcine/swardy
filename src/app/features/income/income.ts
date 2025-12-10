import { Component, OnInit } from '@angular/core';
import { OverviewChartComponent } from '../../shared/components/overview-chart/overview-chart';
import { DashboardService } from '../../services/dashboard.service';
import { CommonModule, NgIf } from '@angular/common';
import { DataTable } from "../../shared/components/data-table/data-table";
import { TableColumn } from '../../shared/model/data-table/table-column.type';
import { IncomeSource } from '../../shared/model/income_source';
import { IncomeProduct } from '../../shared/model/income_product';
import { MatDialog } from '@angular/material/dialog';
import { addIncomeSourcePopup } from '../../shared/components/income/add-income-popup/add-income-source-popup';

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [CommonModule, OverviewChartComponent, DataTable, NgIf],
  templateUrl: './income.html',
  styleUrls: ['./income.css']
})
export class Income implements OnInit {

  overview: { date: string; amount: number }[] = [];
  mode: 'weekly' | 'monthly' | 'yearly' = 'monthly';

  IncomeSourceData: IncomeSource[] = [];
  IncomeProductData: IncomeProduct[] = [];

<<<<<<< HEAD
  isBusiness = false;
  loading = true; // show placeholder until ready
  showProductTable = false;
  title = "Income";

  constructor(private dash: DashboardService) {}
=======
  constructor(
    private dash: DashboardService,
    private dialog: MatDialog
  ) {}
>>>>>>> c7d935c32a3f8d116b0bea2852a1396649bdb9a5

  async ngOnInit() {
    try {
      // 1) Load user first
      await this.dash.loadCurrentUser();
      this.isBusiness = this.dash.isBusinessCached();

      // Decide which table to show immediately
      this.showProductTable = await this.dash.isBusinessAccountSmart();
      if(!this.showProductTable) this.title = "Income Source";

      // 2) Fetch all data in parallel for faster loading
      const [overview, sources, products] = await Promise.all([
        this.dash.getIncomeOverview(this.mode),
        this.dash.fetchIncomeSources(),
        this.dash.fetchIncomeProducts()
      ]);

      this.overview = overview;
      this.IncomeSourceData = sources;
      this.IncomeProductData = products;

    } catch(err) {
      console.error("Failed to load income data:", err);
    } finally {
      this.loading = false; // hide loading placeholder
    }
  }

  async onModeChange(m: 'weekly' | 'monthly' | 'yearly') {
    this.mode = m;
    this.overview = await this.dash.getIncomeOverview(m);
  }

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

<<<<<<< HEAD

  msg="Income";
=======
  // Methods
  onAddIncomeSource() {
    this.dialog.open(addIncomeSourcePopup, {
      width: '100vw',
      maxWidth: '700px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'add-income-source-dialog',
      autoFocus: false
    });
  }
>>>>>>> c7d935c32a3f8d116b0bea2852a1396649bdb9a5
}
