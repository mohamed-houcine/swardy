import { Component, OnInit } from '@angular/core';
import { OverviewChartComponent } from '../../shared/components/overview-chart/overview-chart';
import { DashboardService } from '../../services/dashboard.service';
import { CommonModule } from '@angular/common';
import { DataTable } from "../../shared/data-table/data-table";
import { TableColumn } from '../../shared/model/data-table/table-column.type';
import { IncomeModel, IncomeType } from '../../shared/model/income';

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

  constructor(private dash: DashboardService) {}

  async ngOnInit() {
    this.overview = await this.dash.getIncomeOverview(this.mode);
  }

  async onModeChange(m: 'weekly' | 'monthly' | 'yearly') {
    this.mode = m;
    this.overview = await this.dash.getIncomeOverview(m);
  }

  // DataTable variables
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
  IncomeSearchFactors: string[] = ["name", "employee"];
  IncomeData: IncomeModel[] = [
    { id: "1", name: "MSI OLED Monitor", type: IncomeType.PRODUCT, quantity: 2, employeeName: "Skander Boughnimi", paymentMethod: "Credit Card", amount: 1500, date: "2025-11-20" },
  { id: "2", name: "Logitech Mouse", type: IncomeType.PRODUCT, quantity: 5, employeeName: "Aymen Dridi", paymentMethod: "Cash", amount: 250, date: "2025-11-18" },
  { id: "3", name: "Keyboard Royal Kludge", type: IncomeType.PRODUCT, quantity: 3, employeeName: "Youssef Ben Ali", paymentMethod: "PayPal", amount: 360, date: "2025-11-15" },
  { id: "4", name: "MSI Laptop", type: IncomeType.PRODUCT, quantity: 1, employeeName: "Skander Boughnimi", paymentMethod: "Credit Card", amount: 3200, date: "2025-11-14" },
  { id: "5", name: "Office Chair", type: IncomeType.PRODUCT, quantity: 4, employeeName: "Mariem Khelifi", paymentMethod: "Bank Transfer", amount: 800, date: "2025-11-13" },

  { id: "6", name: "Website Subscription", type: IncomeType.SOURCE, quantity: null, employeeName: "Admin", paymentMethod: "Online", amount: 90, date: "2025-11-10" },
  { id: "7", name: "Cloud Hosting", type: IncomeType.SOURCE, quantity: null, employeeName: "Admin", paymentMethod: "Online", amount: 120, date: "2025-11-09" },
  { id: "8", name: "Consulting Service", type: IncomeType.SOURCE, quantity: null, employeeName: "Skander Boughnimi", paymentMethod: "Bank Transfer", amount: 600, date: "2025-11-08" },

  { id: "9", name: "Samsung SSD 1TB", type: IncomeType.PRODUCT, quantity: 6, employeeName: "Aymen Dridi", paymentMethod: "Credit Card", amount: 900, date: "2025-11-07" },
  { id: "10", name: "RAM 32GB DDR5", type: IncomeType.PRODUCT, quantity: 4, employeeName: "Youssef Ben Ali", paymentMethod: "Cash", amount: 640, date: "2025-11-06" },

  { id: "11", name: "Domain Renewal", type: IncomeType.SOURCE, quantity: null, employeeName: "Admin", paymentMethod: "Online", amount: 18, date: "2025-11-05" },
  { id: "12", name: "Graphic Design Service", type: IncomeType.SOURCE, quantity: null, employeeName: "Mariem Khelifi", paymentMethod: "PayPal", amount: 300, date: "2025-11-04" },

  { id: "13", name: "iPhone 15 Pro", type: IncomeType.PRODUCT, quantity: 1, employeeName: "Skander Boughnimi", paymentMethod: "Credit Card", amount: 5500, date: "2025-11-03" },
  { id: "14", name: "Wireless Headset", type: IncomeType.PRODUCT, quantity: 7, employeeName: "Aymen Dridi", paymentMethod: "Cash", amount: 1050, date: "2025-11-02" },
  { id: "15", name: "Power Bank", type: IncomeType.PRODUCT, quantity: 10, employeeName: "Youssef Ben Ali", paymentMethod: "Credit Card", amount: 500, date: "2025-11-01" },

  { id: "16", name: "Electricity Bill", type: IncomeType.SOURCE, quantity: null, employeeName: "Admin", paymentMethod: "Bank Transfer", amount: 270, date: "2025-10-30" },
  { id: "17", name: "Internet Bill", type: IncomeType.SOURCE, quantity: null, employeeName: "Admin", paymentMethod: "Bank Transfer", amount: 120, date: "2025-10-29" },

  { id: "18", name: "USB-C Cable", type: IncomeType.PRODUCT, quantity: 12, employeeName: "Mariem Khelifi", paymentMethod: "Cash", amount: 180, date: "2025-10-28" },
  { id: "19", name: "External HDD 2TB", type: IncomeType.PRODUCT, quantity: 2, employeeName: "Aymen Dridi", paymentMethod: "Credit Card", amount: 700, date: "2025-10-27" },
  { id: "20", name: "HP Printer", type: IncomeType.PRODUCT, quantity: 1, employeeName: "Skander Boughnimi", paymentMethod: "Bank Transfer", amount: 950, date: "2025-10-26" },

  { id: "21", name: "Security Maintenance", type: IncomeType.SOURCE, quantity: null, employeeName: "Admin", paymentMethod: "Online", amount: 400, date: "2025-10-25" },
  { id: "22", name: "SEO Service", type: IncomeType.SOURCE, quantity: null, employeeName: "Mariem Khelifi", paymentMethod: "PayPal", amount: 500, date: "2025-10-24" },

  { id: "23", name: "Tablet Samsung", type: IncomeType.PRODUCT, quantity: 3, employeeName: "Youssef Ben Ali", paymentMethod: "Cash", amount: 1800, date: "2025-10-23" },
  { id: "24", name: "Desk Lamp", type: IncomeType.PRODUCT, quantity: 8, employeeName: "Aymen Dridi", paymentMethod: "Credit Card", amount: 240, date: "2025-10-22" },
  { id: "25", name: "Office Rent", type: IncomeType.SOURCE, quantity: null, employeeName: "Admin", paymentMethod: "Bank Transfer", amount: 2000, date: "2025-10-01" }
  ];

}
