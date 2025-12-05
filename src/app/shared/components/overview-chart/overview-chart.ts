import { NgIf } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  OnChanges
} from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// ★ Improved Label Plugin ★
const drawValuesPlugin = {
  id: 'drawValuesPlugin',
  afterDatasetsDraw(chart: any) {
    const ctx = chart.ctx;
    const dataset = chart.data.datasets[0];
    const meta = chart.getDatasetMeta(0);
    const maxValue = Math.max(...dataset.data);

    meta.data.forEach((bar: any, i: number) => {
      const value = dataset.data[i];
      const isMax = value === maxValue;

      ctx.save();
      ctx.font = '600 12px Poppins';
      ctx.textAlign = 'center';
      ctx.fillStyle = isMax ? dataset.backgroundColor[i] : '#374151';
      ctx.fillText(`$${value.toLocaleString()}`, bar.x, bar.y - 10);
      ctx.restore();
    });
  }
};

@Component({
  selector: 'app-overview-chart',
  templateUrl: './overview-chart.html',
  styleUrls: ['./overview-chart.css'],
  imports: [NgIf],
  standalone: true
})
export class OverviewChartComponent implements AfterViewInit, OnChanges {

  @Input() title = 'Overview';
  @Input() type: 'income' | 'expense' = 'income';
  @Input() data: { date: string; amount: number }[] = [];

  @Output() modeChange = new EventEmitter<'weekly' | 'monthly' | 'yearly'>();

  menuOpen = false;
  mode: 'weekly' | 'monthly' | 'yearly' = 'monthly';

  get modeLabel() {
    return this.mode === 'weekly'
      ? 'Last 7 Days'
      : this.mode === 'yearly'
      ? 'Last 12 Months'
      : 'Last 28 Days';
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  changeMode(m: 'weekly' | 'monthly' | 'yearly') {
    this.mode = m;
    this.menuOpen = false;
    this.modeChange.emit(m);
  }

  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  chart?: Chart<'bar'>;

  ngAfterViewInit() {
    this.drawChart();
  }

  ngOnChanges() {
    if (this.chart) this.drawChart();
  }

  drawChart() {
    if (!this.canvas) return;

    const labels = this.data.map(d => d.date);
    const values = this.data.map(d => d.amount);
    const max = Math.max(...values);

    const colorSoft =
      this.type === 'income'
        ? 'rgba(16,185,129,0.35)'
        : 'rgba(239,68,68,0.35)';

    const colorBold =
      this.type === 'income'
        ? 'rgb(16,185,129)'
        : 'rgb(239,68,68)';

    const backgroundColors = values.map(v =>
      v === max ? colorBold : colorSoft
    );

    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) this.chart.destroy();

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: backgroundColors,
            borderRadius: 14,
            borderSkipped: false,
            barPercentage: 0.55,
            categoryPercentage: 0.45
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,

        layout: {
          padding: { top: 30 }
        },

        plugins: { legend: { display: false } },

        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#6B7280',
              font: { family: 'Poppins', size: 12 },
              maxRotation: 0,
              minRotation: 0,
              padding: 8
            }
          },
          y: { display: false }
        }
      },
      plugins: [drawValuesPlugin]
    });
  }
}
