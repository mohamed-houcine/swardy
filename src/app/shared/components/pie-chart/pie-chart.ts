import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
Chart.register(...registerables);

// -------------------- PERCENTAGE PLUGIN --------------------
const piePercentPlugin = {
  id: 'piePercentPlugin',
  afterDatasetsDraw(chart: any) {
    const ctx = chart.ctx;

    chart.data.datasets.forEach((dataset: any, datasetIndex: number) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      const total = dataset.data.reduce((a: number, b: number) => a + b, 0);

      meta.data.forEach((element: any, index: number) => {
        const value = dataset.data[index];
        if (!value || total === 0) return;

        const percent = Math.round((value / total) * 100);
        const pos = element.tooltipPosition();

        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 12px Poppins, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillText(percent + '%', pos.x, pos.y);
        ctx.restore();
      });
    });
  }
};
// -----------------------------------------------------------

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pie-chart.html',
  styleUrls: ['./pie-chart.css']
})
export class PieChartComponent implements AfterViewInit, OnChanges {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  @Input() title = '';
  @Input() labels: string[] = [];
  @Input() data: number[] = [];
  @Input() colors: string[] = [];
  @Input() legendPosition: 'top' | 'left' | 'right' | 'bottom' = 'right';
  @Input() doughnut = true;

  private chart?: Chart<'doughnut' | 'pie'>;

  ngAfterViewInit() {
    this.initChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.chart && (changes['labels'] || changes['data'] || changes['colors'])) {
      this.updateChart();
    }
  }

  // -------------------- INIT CHART --------------------
  private initChart() {
    const ctx = this.canvasRef.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration<'doughnut' | 'pie'> = {
      type: this.doughnut ? 'doughnut' : 'pie',
      data: {
        labels: this.labels,
        datasets: [{
          data: this.data,
          backgroundColor: this.colors.length ? this.colors : this.generateColors(this.data.length),
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: this.legendPosition,
            labels: { boxWidth: 12, padding: 8 }
          }
        }
      },
      plugins: [piePercentPlugin]
    };

    this.chart = new Chart(ctx, config);
  }

  // -------------------- UPDATE CHART --------------------
  private updateChart() {
    if (!this.chart) return;
    this.chart.data.labels = this.labels;
    (this.chart.data.datasets[0].data as number[]) = this.data;
    (this.chart.data.datasets[0].backgroundColor as string[]) =
      this.colors.length ? this.colors : this.generateColors(this.data.length);

    this.chart.update();
  }

  // -------------------- RANDOM COLORS --------------------
  private generateColors(n: number) {
    const palette = [
      '#2F80ED','#56CCF2','#6FCF97','#F2994A',
      '#9B51E0','#EB5757','#F2C94C','#BB6BD9',
      '#27AE60', '#2D9CDB'
    ];

    if (n <= palette.length) return palette.slice(0, n);

    const arr = [];
    for (let i = 0; i < n; i++) arr.push(palette[i % palette.length]);
    return arr;
  }

  // -------------------- EXPORT PNG --------------------
  public exportPNG(filename = 'pie-chart.png') {
    const canvas = this.canvasRef.nativeElement;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  }
}
