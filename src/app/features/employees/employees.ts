import { Component } from '@angular/core';
import { PieChartComponent } from "../../shared/components/pie-chart/pie-chart";
import { TotalComponent } from "../../shared/components/total-component/total-component";
import { DataTable } from "../../shared/components/data-table/data-table";
import { TableColumn } from '../../shared/model/data-table/table-column.type';
import { User } from '../../shared/model/user';
import { DashboardService } from '../../services/dashboard.service';
import { NgIf } from '@angular/common';
import { addEmployeePopup } from '../../shared/components/employees/add-employee-popup/add-employee-popup';
import { MatDialog } from '@angular/material/dialog';
import { EmployeeDeletePopup } from '../../shared/components/employees/employee-delete-popup/employee-delete-popup';

@Component({
  selector: 'app-employees',
  imports: [PieChartComponent, TotalComponent, DataTable, NgIf],
  templateUrl: './employees.html',
  styleUrl: './employees.css',
})
export class Employees {
  constructor(
    private dash: DashboardService,
    private dialog: MatDialog
  ) {}

  deleteEmployeeDialog = EmployeeDeletePopup;

  user!: User | null;
  loading: boolean = true;
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
    const [totalEmployees, EOM, ASPE, AET, GenderDist, employees, USER] = await Promise.all([
      this.dash.fetchTotalEmployees(),
      this.dash.fetchEmployeeOfTheMonth(),
      this.dash.fetchAverageSalesPerEmployee(),
      this.dash.fetchActiveEmployeesToday(),
      this.dash.fetchGenderDistribution(),
      this.dash.fetchEmployees(),
      this.dash.loadCurrentUser()
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
    this.loading = false;
    this.user = USER;
  }

  onAddEmployee() {
    const dialogRef = this.dialog.open(addEmployeePopup, {
      width: '100vw',
      maxWidth: '700px',
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'popup',
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(r => this.updateEmployees());
  }

  async updateEmployees() {
    this.EmployeesData = await this.dash.fetchEmployees();
  }


  msg ="Employees"

}
