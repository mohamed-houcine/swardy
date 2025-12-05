// dashboard.service.ts (updated overview helpers for 7d / 28d / 12m)
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
  //  FETCHING FROM SUPABASE (unchanged)
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
    .select(`
      id,
      amount,
      date,
      notes,
      receipt,
      user_id,
      category:category_id ( name ),
      product:product_id ( name )
    `)
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('fetchExpenses error:', error);
    return [];
  }

  return data.map((e: any) => {
    const productName =
      e.product?.name ??
      e.category?.name ??
      e.notes ??
      "Undetermined";

    return {
      id: e.id,
      amount: e.amount,
      date: e.date,
      notes: e.notes,
      receipt: e.receipt,
      userId: e.user_id,

      // 🎯 Use fallbacks
      productName,
      categoryName: e.category?.name ?? "Undetermined",

      // 🎯 No such fields in DB → always define fallback values
      quantity: "-",
      employeeName: "-",
      paymentMethod: "-",
    };
  });
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
  //  MONTHLY TOTALS (unchanged)
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

  async monthlyNetBalance(year: number, incomes: IncomeModel[], expenses: Expense[]): Promise<MonthlyPoint[]> {
    const inc = await this.monthlyTotalsIncome(year, incomes);
    const exp = await this.monthlyTotalsExpenses(year, expenses);

    return inc.map((m, i) => ({
      month: m.month,
      amount: Math.round(m.amount - exp[i].amount)
    }));
  }

  // ---------------------------------------------------
  //  CATEGORY DISTRIBUTION (unchanged)
  // ---------------------------------------------------
  async categoryDistributionForIncomes(
    incomes: IncomeModel[],
    products: Product[],
    categories: Category[]
  ): Promise<CategorySlice[]> {
    const map = new Map<string, number>();

    incomes.forEach(i => {
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
  //  OVERVIEW HELPERS (NEW / UPDATED)
  //  - daily = last N days (fills missing days with 0)
  //  - monthly = last 12 months (month-year buckets, fills missing months with 0)
  // ---------------------------------------------------

  // format day shown on chart labels, e.g. "05 Dec"
  private formatDay(d: Date | string): string {
    const dt = (d instanceof Date) ? d : new Date(d);
    return dt.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
  }

  // format month shown on chart labels, e.g. "Dec 2024"
  private formatMonthYear(year: number, monthIndex: number): string {
    return `${this.months[monthIndex]} ${year}`;
  }

  // returns 'YYYY-MM-DD' normalized key for a date string
  private dateKey(dateString: string | Date): string {
    const d = (dateString instanceof Date) ? dateString : new Date(dateString);
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // returns 'YYYY-MM' key for month aggregation
  private monthKey(dateString: string | Date): { key: string; year: number; monthIndex: number } {
    const d = (dateString instanceof Date) ? dateString : new Date(dateString);
    const y = d.getFullYear();
    const m = d.getMonth(); // 0-based
    return { key: `${y}-${(m + 1).toString().padStart(2, '0')}`, year: y, monthIndex: m };
  }

  // build last N days array of Date objects (inclusive: today and previous N-1 days)
  private lastNDates(n: number): Date[] {
    const arr: Date[] = [];
    const today = new Date();
    // normalize time to 00:00 local to avoid timezone label shifts
    today.setHours(0,0,0,0);
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      arr.push(d);
    }
    return arr;
  }

  // Daily overview for last N days (returns { date: formatted, amount })
  private dailyOverviewFromRecords(data: { date: string; amount: number }[], days: number) {
    const daysArr = this.lastNDates(days);
    const map = new Map<string, number>();
    // initialize all days to 0
    daysArr.forEach(d => map.set(this.dateKey(d), 0));

    // aggregate
    data.forEach(item => {
      const k = this.dateKey(item.date);
      if (map.has(k)) {
        map.set(k, (map.get(k) || 0) + item.amount);
      }
    });

    // build ordered array
    const result = daysArr.map(d => {
      const key = this.dateKey(d);
      return {
        date: this.formatDay(d),
        amount: Math.round(map.get(key) || 0)
      };
    });

    return result;
  }

  // Monthly overview for last 12 months (returns { date: 'Mon YYYY', amount })
  private last12MonthsOverviewFromRecords(data: { date: string; amount: number }[]) {
    const now = new Date();
    // build last 12 months keys (from 11 months ago up to current month)
    const monthsArr: { year: number; monthIndex: number; key: string }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`; // YYYY-MM
      monthsArr.push({ year: d.getFullYear(), monthIndex: d.getMonth(), key });
    }

    // initialize map
    const map = new Map<string, number>();
    monthsArr.forEach(m => map.set(m.key, 0));

    // aggregate into YYYY-MM
    data.forEach(item => {
      const d = new Date(item.date);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      if (map.has(key)) {
        map.set(key, (map.get(key) || 0) + item.amount);
      }
    });

    // build ordered array
    const result = monthsArr.map(m => ({
      date: this.formatMonthYear(m.year, m.monthIndex),
      amount: Math.round(map.get(m.key) || 0)
    }));

    return result;
  }

  // ---------------------------------------------------
  //  PUBLIC API FOR CHARTS (updated)
  //  Modes mapping:
  //   - 'weekly' => last 7 days
  //   - 'monthly' => last 28 days
  //   - 'yearly' => last 12 months
  // ---------------------------------------------------

  async getIncomeOverview(mode: 'weekly' | 'monthly' | 'yearly') {
    const incomes = await this.fetchIncomes();

    // convert supabase records to minimal shape
    const raw = incomes.map(i => ({ date: i.date, amount: i.amount }));

    if (mode === 'yearly') {
      return this.last12MonthsOverviewFromRecords(raw);
    }

    // daily ranges
    if (mode === 'weekly') {
      return this.dailyOverviewFromRecords(raw, 7); // last 7 days
    } else { // monthly => last 28 days
      return this.dailyOverviewFromRecords(raw, 28);
    }
  }

  async getExpenseOverview(mode: 'weekly' | 'monthly' | 'yearly') {
    const expenses = await this.fetchExpenses();

    const raw = expenses.map(e => ({ date: e.date, amount: e.amount }));

    if (mode === 'yearly') {
      return this.last12MonthsOverviewFromRecords(raw);
    }

    if (mode === 'weekly') {
      return this.dailyOverviewFromRecords(raw, 7);
    } else {
      return this.dailyOverviewFromRecords(raw, 28);
    }
  }

}
