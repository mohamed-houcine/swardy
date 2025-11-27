import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TotalComponent } from './shared/components/total-component/total-component';
import { InterfOptions } from './shared/components/interf-options/interf-options';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { ToggleMenuComponent } from './shared/components/toggle-menu-component/toggle-menu-component';
import { GoalComponent } from './shared/components/goal-component/goal-component';
import { NetBalanceComponent } from './shared/components/net-balance/net-balance';
import { PieChartComponent} from './shared/components/pie-chart/pie-chart';

@Component({
  selector: 'app-root',
  imports: [TotalComponent,InterfOptions,FormsModule,GoalComponent,NetBalanceComponent,PieChartComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('swardy');

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
