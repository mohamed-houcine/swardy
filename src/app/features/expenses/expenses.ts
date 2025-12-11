import { Component, OnInit } from '@angular/core';
import { OverviewChartComponent } from '../../shared/components/overview-chart/overview-chart';
import { DashboardService } from '../../services/dashboard.service';
import { CommonModule } from '@angular/common';
import { TableColumn } from '../../shared/model/data-table/table-column.type';
import { DataTable } from '../../shared/components/data-table/data-table';
import { NormalExpense } from '../../shared/model/normal_expense';
import { ProductExpense } from '../../shared/model/product_expense';
import { MatDialog } from '@angular/material/dialog';
import { addExpenseNormalPopup } from '../../shared/components/expenses/add-expense-normal-popup/add-expense-normal-popup';
import { addExpenseProductPopup } from '../../shared/components/expenses/add-expense-product-popup/add-expense-product-popup';
import { ExpenseProductDetailsPopup } from '../../shared/components/expenses/expense-product-details-popup/expense-product-details-popup';
import { ExpenseProductDeletePopup } from '../../shared/components/expenses/expense-product-delete-popup/expense-product-delete-popup';
import { NormalExpenseDetailsPopup } from '../../shared/components/expenses/normal-expense-details-popup/normal-expense-details-popup';
import { NormalExpenseDeletePopup } from '../../shared/components/expenses/normal-expense-delete-popup/normal-expense-delete-popup';

@Component({
  selector: 'app-expense',
  standalone: true,
  imports: [CommonModule, OverviewChartComponent, DataTable],
  templateUrl: './expenses.html',
  styleUrls: ['./expenses.css']
})
export class Expenses implements OnInit {

  expenseProductDetailsDialog = ExpenseProductDetailsPopup;
  expenseProductDeleteDialog = ExpenseProductDeletePopup;
  NormalExpenseDetailsDialog = NormalExpenseDetailsPopup;
  NormalExpenseDeleteDialog = NormalExpenseDeletePopup;

  overview: { date: string; amount: number }[] = [];
  mode: 'weekly' | 'monthly' | 'yearly' = 'monthly';

  NormalExpensesData: NormalExpense[] = [];
  ProductExpensesData: ProductExpense[] = [];
  loading: boolean = true;


  constructor(
    private dash: DashboardService,
    private dialog: MatDialog
  ) {}
  showProductExpenses = false; // better name
  title = "Expense";

  async ngOnInit() {
    // load all data in parallel
    const [overview, normalExpenses, productExpenses, isBusiness] = await Promise.all([
      this.dash.getExpenseOverview(this.mode),
      this.dash.fetchNormalExpenses(),
      this.dash.fetchProductExpenses(),
      this.dash.isBusinessAccountSmart()
    ]);

    this.overview = overview;
    this.NormalExpensesData = normalExpenses;
    this.ProductExpensesData = productExpenses;

    this.showProductExpenses = isBusiness;
    this.loading = false;
    if(this.showProductExpenses) this.title = "Normal Expense";

    this.loading = false; // done loading
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

  onAddNormalExpense() {
    const dialogRef = this.dialog.open(addExpenseNormalPopup, {
      width: '100vw',
      maxWidth: '700px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'popup',
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(r => this.updateProductExpenses());
  }

  onAddProductExpense() {
    const dialogRef = this.dialog.open(addExpenseProductPopup, {
      width: '100vw',
      maxWidth: '700px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'popup',
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(r => this.updateNormalExpenses());
  }

  async updateNormalExpenses() {
    this.NormalExpensesData = await this.dash.fetchNormalExpenses();
  }

  async updateProductExpenses() {
    this.ProductExpensesData = await this.dash.fetchProductExpenses();
  }
  msg = 'Expenses'
}
