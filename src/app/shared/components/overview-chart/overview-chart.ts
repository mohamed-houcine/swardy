import { NgIf } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// Plugin: draw values above bars
const drawValuesPlugin = {
  id: 'drawValuesPlugin',
  afterDatasetsDraw(chart: any) {
    const ctx = chart.ctx;
    const ds = chart.data.datasets[0];

    chart.getDatasetMeta(0).data.forEach((bar: any, i: number) => {
      const value = ds.data[i];
      ctx.save();
      ctx.fillStyle = '#111827';
      ctx.font = '600 12px Poppins';
      ctx.textAlign = 'center';
      ctx.fillText(`$${value.toLocaleString()}`, bar.x, bar.y - 6);
      ctx.restore();
    });
  }
};

@Component({
  selector: 'app-overview-chart',
  templateUrl: './overview-chart.html',
  styleUrls: ['./overview-chart.css'],
  imports:[NgIf]
})
export class OverviewChartComponent implements AfterViewInit {

  // INPUTS
  @Input() title = 'Overview';
  @Input() type: 'income' | 'expense' = 'income';
  @Input() data: { date: string; amount: number }[] = [];

  // OUTPUT to tell the parent about mode switching
  @Output() modeChange = new EventEmitter<'weekly' | 'monthly' | 'yearly'>();

  // Dropdown menu state
  menuOpen = false;
  mode: 'weekly' | 'monthly' | 'yearly' = 'monthly';

  get modeLabel() {
    return this.mode === 'weekly'
      ? 'Hebdomadaire'
      : this.mode === 'yearly'
      ? 'Annuel'
      : 'Mensuel';
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  changeMode(m: 'weekly' | 'monthly' | 'yearly') {
    this.mode = m;
    this.menuOpen = false;
    this.modeChange.emit(m);
  }

  // Chart fields
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  chart?: Chart<'bar'>;

  // ✔ Angular calls this AFTER the view loads → we draw the chart here
  ngAfterViewInit() {
    this.drawChart();
  }

  // 🔥 THE FUNCTION YOU WERE MISSING
  drawChart() {
    if (!this.canvas) return;

    const labels = this.data.map(d => d.date);
    const values = this.data.map(d => d.amount);

    const max = Math.max(...values);

    const colorSoft =
      this.type === 'income'
        ? 'rgba(16,185,129,0.45)'  // green soft
        : 'rgba(239,68,68,0.45)';  // red soft

    const colorBold =
      this.type === 'income'
        ? 'rgb(16,185,129)'        // green bold
        : 'rgb(239,68,68)';        // red bold

    const backgroundColors = values.map(v => (v === max ? colorBold : colorSoft));

    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // destroy old chart if exists (fix for mode switching)
    if (this.chart) this.chart.destroy();

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: backgroundColors,
          borderRadius: 14,
          borderSkipped: false
        }]
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#6B7280',
              font: { family: 'Poppins', size: 12 }
            }
          },
          y: {
            display: false
          }
        }
      },
      plugins: [drawValuesPlugin]
    });
  }

  // OPTIONAL: refresh chart automatically when @Input data changes
  ngOnChanges() {
    if (this.chart) {
      this.drawChart();
    }
  }
}
