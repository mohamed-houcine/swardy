import { Component, AfterViewInit, Input, ViewChild, ElementRef } from '@angular/core';
import JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-barcode',
  imports: [],
  templateUrl: './barcode.html',
  styleUrl: './barcode.css',
})
export class Barcode implements AfterViewInit{
  @Input() codeText: string = '';
  @ViewChild('barcodeSvg', { static: true }) barcodeSvg!: ElementRef<SVGSVGElement>;
  @ViewChild('barcodeCanvas', { static: true }) barcodeCanvas!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit() {
    this.renderBarcode();
  }

  ngOnChanges(): void {
    if (this.codeText) {
      JsBarcode(this.barcodeSvg.nativeElement, this.codeText, {
        format: 'CODE128',
        lineColor: '#000',
        width: 2,
        height: 50,
        displayValue: true
      });
    }
  }

  renderBarcode() {
    if (this.codeText) {
      JsBarcode(this.barcodeSvg.nativeElement, this.codeText, {
        format: 'CODE128',
        lineColor: '#000',
        width: 2,
        height: 50,
        displayValue: true
      });
    }
  }

  downloadBarcode() {
    if (!this.codeText) return;

    // Convert SVG to Canvas
    const svg = this.barcodeSvg.nativeElement;
    const canvas = this.barcodeCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      ctx?.drawImage(image, 0, 0);
      URL.revokeObjectURL(url);

      // Download as PNG
      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = pngUrl;
      link.download = `${this.codeText}.png`;
      link.click();
    };

    image.src = url;
  }
}