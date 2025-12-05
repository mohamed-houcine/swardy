import { Injectable } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';

import { IncomeModel } from '../shared/model/income';
import { Expense } from '../shared/model/expense';
import { Category } from '../shared/model/category';
import { Product } from '../shared/model/product';

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

  constructor(public supabase: SupabaseService) {}

  private months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // ---------------------------------------------------
  //  FETCHING FROM SUPABASE
  // ---------------------------------------------------
  private async getUserId(): Promise<string | null> {
    const { data } = await this.supabase.client.auth.getUser();
    return data.user?.id ?? null;
  }

  async fetchIncomes(): Promise<IncomeModel[]> {
    const userId = await this.getUserId();
    if (!userId) return [];

    const { data, error } = await this.supabase.client
      .from('income')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error) {
      console.error('fetchIncomes error:', error);
      return [];
    }

    return data as IncomeModel[];
  }

  async fetchExpenses(): Promise<Expense[]> {
    const userId = await this.getUserId();
    if (!userId) return [];

    const { data, error } = await this.supabase.client
      .from('expense')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error) {
      console.error('fetchExpenses error:', error);
      return [];
    }

    return data as Expense[];
  }

  async fetchCategories(): Promise<Category[]> {
    const userId = await this.getUserId();
    if (!userId) return [];

    const { data, error } = await this.supabase.client
      .from('category')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('fetchCategories error:', error);
      return [];
    }

    return data as Category[];
  }

  // 🔹 NOUVEAU : récupérer les produits
  async fetchProducts(): Promise<Product[]> {
    const { data, error } = await this.supabase.client
      .from('product')
      .select('*');

    if (error) {
      console.error('fetchProducts error:', error);
      return [];
    }

    return data as Product[];
  }

  // ---------------------------------------------------
  //  MONTHLY TOTALS
  // ---------------------------------------------------

  async monthlyTotalsIncome(year: number, incomes: IncomeModel[]): Promise<MonthlyPoint[]> {
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

  // ---------------------------------------------------
  //  NET BALANCE (Income – Expense per month)
  // ---------------------------------------------------

  async monthlyNetBalance(year: number, incomes: IncomeModel[], expenses: Expense[]): Promise<MonthlyPoint[]> {
    const inc = await this.monthlyTotalsIncome(year, incomes);
    const exp = await this.monthlyTotalsExpenses(year, expenses);

    return inc.map((m, i) => ({
      month: m.month,
      amount: Math.round(m.amount - exp[i].amount)
    }));
  }

  // ---------------------------------------------------
  //  CATEGORY DISTRIBUTION — Incomes (FIXED)
  //  income.product_id -> product.id -> product.id_category -> category.id
  // ---------------------------------------------------

  async categoryDistributionForIncomes(
    incomes: IncomeModel[],
    products: Product[],
    categories: Category[]
  ): Promise<CategorySlice[]> {
    const map = new Map<string, number>();

    incomes.forEach(i => {
      // gérer productId camelCase OU product_id snake_case
      const productId =
        (i as any).productId ??
        (i as any).product_id ??
        null;

      let categoryId: string | null = null;

      if (productId) {
        const prod = products.find(p => p.id === productId);
        if (prod) {
          categoryId = (prod as any).id_category ?? null;
        }
      }

      const key = categoryId ?? 'uncategorized';
      map.set(key, (map.get(key) || 0) + i.amount);
    });

    const result: CategorySlice[] = [];
    for (const [catId, value] of map.entries()) {
      const cat = categories.find(c => c.id === catId);
      result.push({
        label: cat ? cat.name : 'Uncategorized',
        value,
        color: cat?.color || '#ccc'
      });
    }

    return result;
  }

  // ---------------------------------------------------
  //  CATEGORY DISTRIBUTION — Expenses (camelCase/snake_case)
  // ---------------------------------------------------

  async categoryDistributionForExpenses(expenses: Expense[], categories: Category[]): Promise<CategorySlice[]> {
    const map = new Map<string, number>();

    expenses.forEach(e => {
      const key =
        (e as any).categoryId ??
        (e as any).category_id ??
        'uncategorized';

      map.set(key, (map.get(key) || 0) + e.amount);
    });

    const result: CategorySlice[] = [];
    for (const [catId, value] of map.entries()) {
      const cat = categories.find(c => c.id === catId);
      result.push({
        label: cat ? cat.name : 'Uncategorized',
        value,
        color: cat?.color || '#ccc'
      });
    }

    return result;
  }

  // ---------------------------------------------------
  //  OVERVIEW MODES: weekly / monthly / yearly
  // ---------------------------------------------------

  private formatDay(d: string): string {
    return new Date(d).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short"
    });
  }

  private convertToOverview(data: { date: string; amount: number }[]) {
    return data
      .sort((a, b) => +new Date(a.date) - +new Date(b.date))
      .map(d => ({
        date: this.formatDay(d.date),
        amount: d.amount
      }));
  }

  private getWeeklyOverview(data: { date: string; amount: number }[]) {
    return data.slice(-7); // last 7 days
  }

  private getMonthlyOverview(data: { date: string; amount: number }[]) {
    return data.slice(-30); // last 30 days
  }

  private getYearlyOverview(data: IncomeModel[] | Expense[]) {
    const buckets = new Array(12).fill(0);

    data.forEach(item => {
      const d = new Date(item.date);
      buckets[d.getMonth()] += item.amount;
    });

    return buckets.map((amount, idx) => ({
      date: this.months[idx],
      amount
    }));
  }

  // ---------------------------------------------------
  //  PUBLIC API FOR CHARTS
  // ---------------------------------------------------

  async getIncomeOverview(mode: 'weekly' | 'monthly' | 'yearly') {
    const incomes = await this.fetchIncomes();

    if (mode === 'yearly') {
      return this.getYearlyOverview(incomes);
    }

    const raw = incomes.map(i => ({
      date: i.date,
      amount: i.amount
    }));

    const converted = this.convertToOverview(raw);

    return mode === 'weekly'
      ? this.getWeeklyOverview(converted)
      : this.getMonthlyOverview(converted);
  }

  async getExpenseOverview(mode: 'weekly' | 'monthly' | 'yearly') {
    const expenses = await this.fetchExpenses();

    if (mode === 'yearly') {
      return this.getYearlyOverview(expenses);
    }

    const raw = expenses.map(e => ({
      date: e.date,
      amount: e.amount
    }));

    const converted = this.convertToOverview(raw);

    return mode === 'weekly'
      ? this.getWeeklyOverview(converted)
      : this.getMonthlyOverview(converted);
  }

}
