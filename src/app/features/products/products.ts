import { Component } from '@angular/core';
import { PieChartComponent } from "../../shared/components/pie-chart/pie-chart";
import { DataTable } from "../../shared/components/data-table/data-table";
import { TableColumn } from '../../shared/model/data-table/table-column.type';
import { Product } from '../../shared/model/product';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-products',
  imports: [PieChartComponent, DataTable],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products {
  constructor(private dash: DashboardService) {}

  // Pie Charts
  BSProductLabels: string[] = [];
  BSProductData: number[] = [];
  BSProductColors: string[] = [];

  productIncomeLabels: string[] = [];
  productIncomeData: number[] = [];
  productIncomeColors: string[] = [];

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
    console.log(products);
  }


}