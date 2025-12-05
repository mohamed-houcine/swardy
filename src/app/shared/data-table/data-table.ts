import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TableColumn } from '../model/data-table/table-column.type';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-data-table',
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './data-table.html',
  styleUrl: './data-table.css',
})
export class DataTable {
  Math = Math;
  @Input() title!: string;
  @Input() columns!: TableColumn[];
  @Input() data!: any[];
  @Input() SearchFactors!: string[];

  
  // Pagination
  pageSizeOptions = [5, 10, 20, 50];
  pageSize = 5;
  currentPage = 1;
  

  get paginatedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredData.slice(start, end);
  }
  
  get totalPages() {
    return Math.max(1, Math.ceil(this.filteredData.length / this.pageSize));
  }
  
  onPageSizeChange(newSize: number) {
    this.pageSize = Number(newSize);
    this.currentPage = 1;
  }

  // Search
  searchTerm: string = '';

  get filteredData() {
    if (!this.searchTerm) return this.sortedData;

    const term = this.searchTerm.toLowerCase();

    return this.sortedData.filter(item => 
      this.SearchFactors.some(factor => 
        item[factor] != null && String(item[factor]).toLowerCase().includes(term)
      )
    );
  }
  
  // Sorting
  sortedData: any[] = [];
  
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

  ngOnChanges() {
    this.sortedData = [...this.data];
  }
}
