import { Component } from '@angular/core';
import { PieChartComponent } from "../../shared/components/pie-chart/pie-chart";
import { DataTable } from "../../shared/components/data-table/data-table";
import { TableColumn } from '../../shared/model/data-table/table-column.type';
import { Product } from '../../shared/model/product';
import { DashboardService } from '../../services/dashboard.service';
import { MatDialog } from '@angular/material/dialog';
import { addProductPopup } from '../../shared/components/product/add-product-popup/add-product-popup';
import { ProductDetailsPopup } from '../../shared/components/product/product-details-popup/product-details-popup';
import { ProductDeletePopup } from '../../shared/components/product/product-delete-popup/product-delete-popup';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-products',
  imports: [PieChartComponent, DataTable, NgIf],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products {
  constructor(
    private dash: DashboardService,
    private dialog: MatDialog
  ) {}

  productDetailsDialog = ProductDetailsPopup;
  productDeleteDialog = ProductDeletePopup;

  // Pie Charts
  BSProductLabels: string[] = [];
  BSProductData: number[] = [];
  BSProductColors: string[] = [];

  productIncomeLabels: string[] = [];
  productIncomeData: number[] = [];
  productIncomeColors: string[] = [];
  loading: boolean = true;

  // Data Table
  ProductColumnsNames: TableColumn[] = [
    {title: "Name", iconUrl: "assets/icons/data-table/name.svg", canBeSorted: true, key: "name"},
    {title: "Category", iconUrl: "assets/icons/data-table/name.svg", canBeSorted: true, key: "category"},
    {title: "Price", iconUrl: "assets/icons/data-table/amount.svg", canBeSorted: true, key: "price"},
    {title: "Actions", iconUrl: "assets/icons/data-table/actions.svg", canBeSorted: false, key: ""}
  ];
  ProductSearchFactors: string[] = ["name", "category"];
  ProductData!: Product[];

  async ngOnInit() {
    const [productDist, productIncome, categories, products] = await Promise.all([
      this.dash.fetchBestSellingProducts(),
      this.dash.fetchIncomeProducts(),
      this.dash.fetchCategories(),
      this.dash.fetchProducts()
    ]);

    console.log(productDist);

    this.BSProductLabels = productDist.map(x => x.label);
    this.BSProductData = productDist.map(x => x.value);
    this.BSProductColors = productDist.map(x => x.color);

    const productIncomeDist = await this.dash.categoryDistribution(
      productIncome,
      categories
    );

    this.productIncomeLabels = productIncomeDist.map(x => x.label);
    this.productIncomeData = productIncomeDist.map(x => x.value);
    this.productIncomeColors = productIncomeDist.map(x => x.color);

    this.ProductData = products;
    console.log(productIncomeDist);
    this.loading = false;
  }

  onAddProduct() {
    this.dialog.open(addProductPopup, {
      width: '100vw',
      maxWidth: '700px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'popup',
      autoFocus: false
    });
  }

}