import { Component } from '@angular/core';
import { PieChartComponent } from "../../shared/components/pie-chart/pie-chart";
import { TotalComponent } from "../../shared/components/total-component/total-component";
import { Dashboard } from "../dashboard/dashboard";
import { DataTable } from "../../shared/components/data-table/data-table";
import { TableColumn } from '../../shared/model/data-table/table-column.type';
import { User } from '../../shared/model/user';
import { DashboardService } from '../../services/dashboard.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-employees',
  imports: [PieChartComponent, TotalComponent, DataTable, NgIf],
  templateUrl: './employees.html',
  styleUrl: './employees.css',
})
export class Employees {
  constructor(private dash: DashboardService) {}

  totalEmployees!: number;
  EOMname!: string | undefined;
  EOMimg!: string | undefined;
  avgSalePerEmployee!: number;
  activeEmployees!: number;
  GenderLabels: string[] = [];
  GenderData: number[] = [];
  GenderColors: string[] = [];
  EmployeesColumnsNames: TableColumn[] = [
    {title: "First Name", iconUrl: "assets/icons/data-table/name.svg", canBeSorted: true, key: "first_name"},
    {title: "Last Name", iconUrl: "assets/icons/data-table/name.svg", canBeSorted: true, key: "last_name"},
    {title: "Gender", iconUrl: "assets/icons/data-table/name.svg", canBeSorted: true, key: "gender"},
    {title: "Tel N°", iconUrl: "assets/icons/data-table/numbers.svg", canBeSorted: true, key: "tel_number"},
    {title: "Email", iconUrl: "assets/icons/data-table/name.svg", canBeSorted: true, key: "email"},


    {title: "Actions", iconUrl: "assets/icons/data-table/actions.svg", canBeSorted: false, key: ""}

  ];
  EmployeesData: User[] = [];
  EmployeesSearchFactors: string[] = ["first_name", 'last_name'];

  async ngOnInit() {
    const [totalEmployees, EOM, ASPE, AET, GenderDist, employees] = await Promise.all([
      this.dash.fetchTotalEmployees(),
      this.dash.fetchEmployeeOfTheMonth(),
      this.dash.fetchAverageSalesPerEmployee(),
      this.dash.fetchActiveEmployeesToday(),
      this.dash.fetchGenderDistribution(),
      this.dash.fetchEmployees()
    ]);

    this.totalEmployees = totalEmployees;
    this.EOMname = EOM?.name;
    this.EOMimg = EOM?.avatar_url;
    this.avgSalePerEmployee = ASPE;
    this.activeEmployees = AET;
    this.GenderLabels = GenderDist.map(x => x.label);
    this.GenderData = GenderDist.map(x => x.value);
    this.GenderColors = GenderDist.map(x => x.color);
    this.EmployeesData = employees;
  }


    msg ="Employees"

}
