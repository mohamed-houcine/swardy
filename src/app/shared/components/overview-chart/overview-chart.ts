import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Chart, registerables, ChartConfiguration } from 'chart.js';

Chart.register(...registerables);

// plugin → draw values above bars
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
  styleUrls: ['./overview-chart.css']
})
export class OverviewChartComponent implements AfterViewInit {

  @Input() title = 'Overview';
  @Input() type: 'income' | 'expense' = 'income';
  @Input() data: { date: string; amount: number }[] = [];

  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  chart?: Chart<'bar'>;

  ngAfterViewInit() {
    this.initializeChart();
  }

  initializeChart() {
    const labels = this.data.map(d => d.date);
    const values = this.data.map(d => d.amount);

    const colorBase =
      this.type === 'income'
        ? 'rgba(34,197,94,0.45)'    // green soft
        : 'rgba(244,63,94,0.45)';  // red soft

    const colorHighlight =
      this.type === 'income'
        ? 'rgb(16, 185, 129)'       // green bold
        : 'rgb(239, 68, 68)';        // red bold

    const max = Math.max(...values);
    const backgroundColors = values.map(v => (v === max ? colorHighlight : colorBase));

    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: backgroundColors,
            borderRadius: 14,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#6B7280',
              font: { family: 'Poppins', size: 12 }
            }
          },
          y: { display: false }
        }
      },
      plugins: [drawValuesPlugin]
    });
  }
}
