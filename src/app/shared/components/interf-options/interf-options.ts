import { NgFor } from '@angular/common';
import { Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-interf-options',
  imports: [NgFor],
  templateUrl: './interf-options.html',
  styleUrl: './interf-options.css',
})
export class InterfOptions {
  @Output() selectedOption = new EventEmitter<{ key: number; name: string }>();

  interfOptions = [
    { key: 0, name: 'Dashboard', iconUrl: '/assets/icons/dashboard_0.svg', activeIconUrl: '/assets/icons/dashboard_1.svg' },
    { key: 1, name: 'Income', iconUrl: '/assets/icons/income_0.svg', activeIconUrl: '/assets/icons/income_1.svg' },
    { key: 2, name: 'Expense', iconUrl: '/assets/icons/expense_0.svg', activeIconUrl: '/assets/icons/expense_1.svg' },
    { key: 3, name: 'Employees', iconUrl: '/assets/icons/employees_0.svg', activeIconUrl: '/assets/icons/employees_1.svg' },
    { key: 4, name: 'Products', iconUrl: '/assets/icons/products_0.svg', activeIconUrl: '/assets/icons/products_1.svg' },
  ];

  activeinterfOptionsKey = 0;

  setActiveinterfOptionsKey(key: number) {
    this.activeinterfOptionsKey = key;
    const selected = this.interfOptions.find(f => f.key === key);
    if (selected) this.selectedOption.emit(selected);
  }

}
