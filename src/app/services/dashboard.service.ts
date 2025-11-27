import { Injectable } from '@angular/core';

import { Income } from '../shared/model/income';
import { Expense } from '../shared/model/expense';
import { Category } from '../shared/model/category';

// returned objects
export interface MonthlyPoint {
  month: string;
  amount: number;
}

export interface CategorySlice {
  label: string;
  value: number;
  color?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  // Month names
  private months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  //------------------------------------------
  // TEMPORARY MOCK DATA (replace with backend)
  //------------------------------------------

  private mockIncomes: Income[] = [
    { id:'i1', amount:10000, date:'2025-01-12', userId:'u1', source_type:'personal' as any },
    { id:'i2', amount:20000, date:'2025-02-19', userId:'u1', source_type:'personal' as any },
    { id:'i3', amount:40000, date:'2025-03-05', userId:'u1', source_type:'personal' as any },
    { id:'i4', amount:35000, date:'2025-05-07', userId:'u1', source_type:'personal' as any },
    { id:'i5', amount:18000, date:'2025-07-10', userId:'u1', source_type:'personal' as any },
    { id:'i6', amount:36000, date:'2025-12-01', userId:'u1', source_type:'personal' as any }
  ];

  private mockExpenses: Expense[] = [
    { id:'e1', amount:500, date:'2025-11-12', userId:'u1', categoryId:'c1' },
    { id:'e2', amount:800, date:'2025-11-10', userId:'u1', categoryId:'c2' },
    { id:'e3', amount:750, date:'2025-11-12', userId:'u1', categoryId:'c1' },
    { id:'e4', amount:150, date:'2025-11-12', userId:'u1', categoryId:'c3' },
    { id:'e5', amount:230, date:'2025-11-12', userId:'u1', categoryId:'c4' },
    { id:'e6', amount:20000, date:'2025-03-10', userId:'u1', categoryId:'c5' },
    { id:'e7', amount:5000, date:'2025-03-12', userId:'u1', categoryId:'c2' }
  ];

  private mockCategories: Category[] = [
    { id:'c1', name:'Monitor OLED', icon:'', color:'#2F80ED', userId:'u1'},
    { id:'c2', name:'Bills', icon:'', color:'#56CCF2', userId:'u1'},
    { id:'c3', name:'Transport', icon:'', color:'#6FCF97', userId:'u1'},
    { id:'c4', name:'Keyboard', icon:'', color:'#F2994A', userId:'u1'},
    { id:'c5', name:'Office', icon:'', color:'#9B51E0', userId:'u1'}
  ];

  //------------------------------------------
  // FETCHING — replace with HttpClient later
  //------------------------------------------

  async fetchIncomes(): Promise<Income[]> {
    return Promise.resolve(this.mockIncomes);
  }

  async fetchExpenses(): Promise<Expense[]> {
    return Promise.resolve(this.mockExpenses);
  }

  async fetchCategories(): Promise<Category[]> {
    return Promise.resolve(this.mockCategories);
  }

  //------------------------------------------
  // AGGREGATION METHODS (USED BY CHARTS)
  //------------------------------------------

  async monthlyTotalsIncome(year: number, incomes: Income[]): Promise<MonthlyPoint[]> {
    const buckets = new Array(12).fill(0);

    incomes.forEach(i => {
      const d = new Date(i.date);
      if (d.getFullYear() === year) {
        buckets[d.getMonth()] += i.amount;
      }
    });

    return buckets.map((amount, idx) => ({
      month: this.months[idx],
      amount: Math.round(amount)
    }));
  }

  async monthlyTotalsExpenses(year: number, expenses: Expense[]): Promise<MonthlyPoint[]> {
    const buckets = new Array(12).fill(0);

    expenses.forEach(e => {
      const d = new Date(e.date);
      if (d.getFullYear() === year) {
        buckets[d.getMonth()] += e.amount;
      }
    });

    return buckets.map((amount, idx) => ({
      month: this.months[idx],
      amount: Math.round(amount)
    }));
  }

  //------------------------------------------
  // NET BALANCE (Income – Expense per month)
  //------------------------------------------
  async monthlyNetBalance(year: number, incomes: Income[], expenses: Expense[]): Promise<MonthlyPoint[]> {
    const inc = await this.monthlyTotalsIncome(year, incomes);
    const exp = await this.monthlyTotalsExpenses(year, expenses);

    return inc.map((m, i) => ({
      month: m.month,
      amount: Math.round(m.amount - exp[i].amount)
    }));
  }

  //------------------------------------------
  // CATEGORY DISTRIBUTION — Incomes
  //------------------------------------------
  async categoryDistributionForIncomes(incomes: Income[], categories: Category[]): Promise<CategorySlice[]> {
    const map = new Map<string, number>();

    incomes.forEach(i => {
      const key = (i as any).categoryId || 'uncategorized';
      map.set(key, (map.get(key) || 0) + i.amount);
    });

    const result: CategorySlice[] = [];
    for (const [catId, value] of map.entries()) {
      const cat = categories.find(c => c.id === catId);
      result.push({
        label: cat ? cat.name : catId,
        value,
        color: cat?.color
      });
    }

    return result;
  }

  //------------------------------------------
  // CATEGORY DISTRIBUTION — Expenses
  //------------------------------------------
  async categoryDistributionForExpenses(expenses: Expense[], categories: Category[]): Promise<CategorySlice[]> {
    const map = new Map<string, number>();

    expenses.forEach(e => {
      const key = e.categoryId || 'uncategorized';
      map.set(key, (map.get(key) || 0) + e.amount);
    });

    const result: CategorySlice[] = [];
    for (const [catId, value] of map.entries()) {
      const cat = categories.find(c => c.id === catId);
      result.push({
        label: cat ? cat.name : catId,
        value,
        color: cat?.color
      });
    }

    return result;
  }
}
