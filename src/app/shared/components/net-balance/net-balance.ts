import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { DashboardService } from '../../../services/dashboard.service';
import { ToggleMenuComponent } from '../toggle-menu-component/toggle-menu-component';
import { inject } from '@angular/core';

Chart.register(...registerables);

// plugin: draw value + percentage above each bar
const barValuePlugin = {
  id: 'barValuePlugin',
  afterDatasetsDraw(chart: any) {
    const ctx = chart.ctx;
    const ds = chart.data.datasets[0];
    if (!ds) return;

    chart.getDatasetMeta(0).data.forEach((bar: any, index: number) => {
      const value = ds.data[index] ?? 0;
      const x = bar.x;
      const y = bar.y - 6;

      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#111827';
      ctx.font = '600 12px Poppins, sans-serif';
      const displayValue = (typeof value === 'number') ? value.toLocaleString() : String(value);
      ctx.fillText(displayValue, x, y);
      ctx.restore();
    });
  }
};


@Component({
  selector: 'app-net-balance',
  standalone: true,
  imports: [CommonModule, ToggleMenuComponent],
  templateUrl: './net-balance.html',
  styleUrls: ['./net-balance.css'],
})
export class NetBalanceComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart<'bar'>;
  private svc = inject(DashboardService);

  // UI state
  months: string[] = [];
  values: number[] = [];
  years: number[] = [];
  selectedYear!: number;

  // colors
  positiveColor = 'rgba(178, 165, 255, 1)';
  negativeColor = 'rgba(255,99,132,0.9)';

  private destroyed = false;

  constructor() {
    // build recent years (current and 4 previous)
    const now = new Date().getFullYear();
    this.years = Array.from({ length: 6 }, (_, i) => now - i);
    this.selectedYear = now;
  }

  async ngAfterViewInit() {
    await this.loadForYear(this.selectedYear);
    this.initChart();
  }

  ngOnDestroy() {
    this.destroyed = true;
    try { this.chart?.destroy(); } catch {}
  }

  // called when user picks new year via select (change event wired in template)
  async onYearChange(yearStr: string) {
    const year = Number(yearStr);
    if (isNaN(year)) return;
    this.selectedYear = year;
    const net = await this.svc.monthlyNetBalance(year, await this.svc.fetchIncomes(), await this.svc.fetchExpenses());
    this.months = net.map(m => m.month);
    this.values = net.map(m => m.amount);
    this.updateChart();
  }

  // loads data and sets months/values
  private async loadForYear(year: number) {
    const [incomes, expenses] = await Promise.all([this.svc.fetchIncomes(), this.svc.fetchExpenses()]);
    const net = await this.svc.monthlyNetBalance(year, incomes, expenses);
    this.months = net.map(m => m.month);
    this.values = net.map(m => m.amount);
  }

  // initialize Chart.js bar chart
  private initChart() {
    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const cfg: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: this.months,
        datasets: [{
          label: 'Net Balance',
          data: this.values,
          backgroundColor: this.values.map(v => v >= 0 ? this.positiveColor : this.negativeColor),
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#6B7280' } },
          y: { beginAtZero: true, ticks: { color: '#6B7280' } }
        }
      },
      plugins: [barValuePlugin]
    };

    this.chart = new Chart(ctx, cfg);
  }

  // update data and refresh chart
  private updateChart() {
    if (!this.chart) return;
    (this.chart.data.labels as string[]) = this.months;
    (this.chart.data.datasets[0].data as number[]) = this.values;
    (this.chart.data.datasets[0].backgroundColor as string[]) = this.values.map(v => v >= 0 ? this.positiveColor : this.negativeColor);
    this.chart.update();
  }


// inside NetBalanceComponent class

// handle year selected from ToggleMenuComponent
async onYearSelected(year: number) {
  // set selectedYear if you store it
  this.selectedYear = year;

  // load data and update internal state
  await this.loadForYear(year);

  // refresh chart (uses months/values set by loadForYear)
  this.updateChart();
}



  // Export current canvas as PNG
  exportPNG(filename = `net-balance-${this.selectedYear}.png`) {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png', 1);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  }
}
