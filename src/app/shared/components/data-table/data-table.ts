import { Component, EventEmitter, Input, Output, ElementRef, ViewChild, HostListener } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';

import html2canvas from 'html2canvas';
import { FormsModule } from '@angular/forms';
import { TableColumn } from '../../model/data-table/table-column.type';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-data-table',
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './data-table.html',
  styleUrls: ['./data-table.css'],
})
export class DataTable {
  constructor (private dialog: MatDialog, private router: Router) {}
  
  Math = Math;

  // Inputs
  @Input() title!: string;
  @Input() columns!: TableColumn[];
  @Input() data!: any[];
  @Input() SearchFactors!: string[];
  @Input() entityName:string="Data"
  @Input() detailsDialogComponent!: any; // Component for details popup
  @Input() deleteDialogComponent!: any;  // Component for delete popup
  @Input() detailsRoutePrefix?: string;  // NEW: e.g., '/products' or '/employees'
  @Input() useRouterForDetails: boolean = false; // NEW: Flag to use router instead of dialog

  // Outputs
  @Output() onAdd = new EventEmitter<void>();
  @Output() onDetailsClick = new EventEmitter<any>(); // NEW: For custom logic

  handleAddClick() {
    this.onAdd.emit();
  }

  // Open Details Dialog or Navigate
  openDetails(row: any) {
    // Option 1: Emit event for parent to handle (most flexible)
    if (this.onDetailsClick.observers.length > 0) {
      this.onDetailsClick.emit(row);
      return;
    }

    // Option 2: Use router navigation
    if (this.useRouterForDetails && this.detailsRoutePrefix) {
      this.router.navigate([`${this.detailsRoutePrefix}/${row.id}`]);
      return;
    }

    // Option 3: Use dialog (default behavior)
    if (!this.detailsDialogComponent) {
      console.error('No details dialog component provided');
      return;
    }

    const dialogRef = this.dialog.open(this.detailsDialogComponent, {
      data: { id: row.id, rowData: { ...row } },
      width: '600px',
      panelClass: 'popup'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.updatedRow) {
        const index = this.data.findIndex(item => item.id === result.updatedRow.id);
        if (index !== -1) {
          this.data[index] = { ...result.updatedRow };
          this.sortedData = [...this.data];
        }
      }
    });
  }

  // Open Delete Dialog
  openDelete(row: any) {
    if (!this.deleteDialogComponent) {
      console.error('No delete dialog component provided');
      return;
    }

    const dialogRef = this.dialog.open(this.deleteDialogComponent, {
      data: { id: row.id, rowData: row },
      width: '400px',
      panelClass: 'popup'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'deleted') {
        this.data = this.data.filter(item => item.id !== row.id);
        this.sortedData = [...this.data];
      }
    });
  }

  // ... rest of the code remains the same
  
  // Pagination
  pageSizeOptions = [5, 10, 20, 50];
  pageSize = 5;
  currentPage = 1;

  // Sorting
  sortedData: any[] = [];

  // Search
  searchTerm: string = '';

  @ViewChild('tableRef') tableRef!: ElementRef;
  @ViewChild('exportMenu') exportMenu!: ElementRef;

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.isExportMenuOpen) return;

    if (this.exportMenu && !this.exportMenu.nativeElement.contains(event.target)) {
      this.isExportMenuOpen = false;
    }
  }

  get filteredData() {
    if (!this.searchTerm) return this.sortedData;

    const term = this.searchTerm.toLowerCase();

    let results = this.sortedData.filter(item =>
      this.SearchFactors.some(factor =>
        item[factor] != null && String(item[factor]).toLowerCase().includes(term)
      )
    );

    if (results.length === 0) {
      results = this.sortedData.filter(item =>
        Object.keys(item).some(key =>
          item[key] != null && String(item[key]).toLowerCase().includes(term)
        )
      );
    }

    return results;
  }

  get paginatedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredData.slice(start, end);
  }

  get totalPages() {
    return Math.max(1, Math.ceil(this.filteredData.length / this.pageSize));
  }

  ngOnChanges() {
    this.sortedData = [...this.data];
  }

  onPageSizeChange(newSize: number) {
    this.pageSize = Number(newSize);
    this.currentPage = 1;
  }

  onSort(column: TableColumn) {
    if (!column.canBeSorted) return;

    this.columns.forEach(col => {
      if (col !== column) col.direction = undefined;
    });

    column.direction = column.direction === 'asc' ? 'desc' : 'asc';

    const key = column.key;
    const direction = column.direction;

    this.sortedData = [...this.sortedData].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return direction === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    this.currentPage = 1;
  }

  isExportMenuOpen: boolean = false;

  toggleMenu() {
    this.isExportMenuOpen = !this.isExportMenuOpen;
  }

  exportData(format: 'csv' | 'png') {
    if (format === 'csv') {
      const csv = this.convertToCSV(this.filteredData);
      this.downloadFile(csv, 'data.csv', 'text/csv');
    } else {
      this.downloadPNG();
    }
  }

  private downloadFile(data: string, filename: string, type: string) {
    const blob = new Blob([data], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  private async downloadPNG(): Promise<void> {
    try {
      if (!this.tableRef || !this.tableRef.nativeElement) return;

      const el = this.tableRef.nativeElement as HTMLElement;

      const originalBackground = el.style.background;
      const originalFilter = el.style.filter;
      const originalBackdrop = el.style.backdropFilter;

      el.style.background = '#ffffff';
      el.style.filter = 'none';
      el.style.backdropFilter = 'none';

      await new Promise(r => setTimeout(r, 50));

      const canvas = await html2canvas(el, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false
      });

      el.style.background = originalBackground;
      el.style.filter = originalFilter;
      el.style.backdropFilter = originalBackdrop;

      const link = document.createElement('a');
      link.download = 'data-table.png';
      link.href = canvas.toDataURL('image/png');
      link.click();

    } catch (err) {
      console.error('PNG export failed:', err);
      alert('PNG export failed. Check console.');
    }
  }

  private convertToCSV(data: any[]) {
    if (!data || data.length === 0) return '';

    const keys = Object.keys(data[0]);
    const csvRows = [keys.join(',')];

    for (const row of data) {
      csvRows.push(keys.map(k => `"${row[k]}"`).join(','));
    }

    return csvRows.join('\n');
  }
}