import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TableColumn } from '../model/data-table/table-column.type';

@Component({
  selector: 'app-data-table',
  imports: [NgFor, NgIf],
  templateUrl: './data-table.html',
  styleUrl: './data-table.css',
})
export class DataTable {
  @Input() title!: string;
  @Input() columns!: TableColumn[];
  @Input() data!: any[];
  @Input() SearchFactors!: string[];

  onSort(column: TableColumn) {
    // Reset other columns
    this.columns.forEach(col => {
      if (col !== column) col.direction = undefined;
    });

    // Toggle direction
    column.direction = column.direction === 'asc' ? 'desc' : 'asc';

    const key = column.title;
    const direction = column.direction;

    this.data.sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }
}
