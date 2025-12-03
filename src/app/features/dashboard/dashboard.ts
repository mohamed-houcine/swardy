import { Component } from '@angular/core';
import { TotalComponent } from "../../shared/components/total-component/total-component";
import { NetBalanceComponent } from "../../shared/components/net-balance/net-balance";
import { GoalComponent } from "../../shared/components/goal-component/goal-component";
import { PieChartComponent } from "../../shared/components/pie-chart/pie-chart";

@Component({
  selector: 'app-dashboard',
  imports: [TotalComponent, NetBalanceComponent, GoalComponent, PieChartComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  name:string="Mohamed";

  years = [2023, 2024, 2025, 2026, 2027];
  selectedYear = 2025;

  months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  netValues = [10000,20000,40000,30000,35000,20000,38000,36000,39000,35000,30000,36000];

  incomeLabels = ['Monitor OLED','Diamond FF','Keyboard','Mouse'];
  incomeData = [50,20,13,7];
  incomeColors = ['#2F80ED','#56CCF2','#6FCF97','#F2994A'];

  expenseLabels = ['Bills','Product','Transport','Other'];
  expenseData = [1000,1500,700,300];
  expenseColors = ['#2F80ED','#9B51E0','#6FCF97','#F2994A'];
}
