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
import { RecentTransactionComponent } from './shared/components/recent-transaction-component/recent-transaction-component';
import { OverviewChartComponent } from './shared/components/overview-chart/overview-chart';

@Component({
  selector: 'app-root',
  imports: [TotalComponent,InterfOptions,FormsModule,GoalComponent,NetBalanceComponent,PieChartComponent,RecentTransactionComponent,OverviewChartComponent],
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



incomeDatas = [
  { date: '26 Oct', amount: 12000 },
  { date: '27 Oct', amount: 18000 },
  { date: '28 Oct', amount: 10000 },
  { date: '29 Oct', amount: 15000 },
  { date: '30 Oct', amount: 22000 },
  { date: '31 Oct', amount: 9000 },

  { date: '01 Nov', amount: 17000 },
  { date: '02 Nov', amount: 13000 },
  { date: '03 Nov', amount: 24000 },
  { date: '04 Nov', amount: 19000 },
  { date: '05 Nov', amount: 21000 },
  { date: '06 Nov', amount: 16000 },
  { date: '07 Nov', amount: 12000 },
  { date: '08 Nov', amount: 20000 },
  { date: '09 Nov', amount: 18000 },
  { date: '10 Nov', amount: 25000 },
  { date: '11 Nov', amount: 10000 },
  { date: '12 Nov', amount: 20000 },
  { date: '13 Nov', amount: 40000 }, // MAX → highlighted
  { date: '14 Nov', amount: 20000 },
  { date: '15 Nov', amount: 20000 },
  { date: '16 Nov', amount: 20000 },
  { date: '17 Nov', amount: 20000 },
  { date: '18 Nov', amount: 20000 },
  { date: '19 Nov', amount: 20000 },
  { date: '20 Nov', amount: 20000 },
  { date: '21 Nov', amount: 20000 },
  { date: '22 Nov', amount: 20000 }
];


expenseDatas = [
  { date: '26 Oct', amount: 5000 },
  { date: '27 Oct', amount: 7000 },
  { date: '28 Oct', amount: 4000 },
  { date: '29 Oct', amount: 6500 },
  { date: '30 Oct', amount: 9000 },
  { date: '31 Oct', amount: 3000 },

  { date: '01 Nov', amount: 8000 },
  { date: '02 Nov', amount: 5000 },
  { date: '03 Nov', amount: 11000 },
  { date: '04 Nov', amount: 7000 },
  { date: '05 Nov', amount: 9000 },
  { date: '06 Nov', amount: 5000 },
  { date: '07 Nov', amount: 4000 },
  { date: '08 Nov', amount: 9000 },
  { date: '09 Nov', amount: 7000 },
  { date: '10 Nov', amount: 20000 },
  { date: '11 Nov', amount: 10000 },
  { date: '12 Nov', amount: 20000 },
  { date: '13 Nov', amount: 40000 }, // MAX → highlighted red
  { date: '14 Nov', amount: 20000 },
  { date: '15 Nov', amount: 20000 },
  { date: '16 Nov', amount: 20000 },
  { date: '17 Nov', amount: 20000 },
  { date: '18 Nov', amount: 20000 },
  { date: '19 Nov', amount: 20000 },
  { date: '20 Nov', amount: 20000 },
  { date: '21 Nov', amount: 20000 },
  { date: '22 Nov', amount: 20000 }
];





}
