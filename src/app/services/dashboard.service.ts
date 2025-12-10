// dashboard.service.ts (updated overview helpers + smart account-type resolution)
import { Injectable } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';

import { Category } from '../shared/model/category';
import { Product } from '../shared/model/product';
import { IncomeProduct } from '../shared/model/income_product';
import { IncomeSource } from '../shared/model/income_source';
import { NormalExpense } from '../shared/model/normal_expense';
import { ProductExpense } from '../shared/model/product_expense';
import { ThemeMode, User, UserRole, UserType } from '../shared/model/user';

// returned objects
export interface MonthlyPoint {
  month: string;
  amount: number;
}

export interface CategorySlice {
  label: string;
  value: number;
  color: string;
}

type Income = IncomeProduct | IncomeSource;
type Expense = NormalExpense | ProductExpense;

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(public supabase: SupabaseService) {
    // Auth state listener: clear/refresh cached user on sign-out/sign-in
    try {
      this.supabase.client.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          this.clearUserCache();
        } else if (event === 'SIGNED_IN') {
          this.loadCurrentUser(true).catch(err => console.warn('Failed to reload user on sign-in', err));
        }
      });
    } catch (e) {
      // ignore if SDK differs
      console.debug('Auth listener not initialized', e);
    }
  }

  private months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // -------------------------
  // cached current user
  // -------------------------
  // undefined => not loaded yet, null => loaded but not found / error, User => loaded
  private _cachedUser: User | null | undefined = undefined;

  private normalizeType(raw?: string | null): string | null {
    if (!raw) return null;
    const v = raw.trim().toLowerCase();
    if (v === 'personnel' || v === 'personal' || v === 'private') return 'personal';
    if (v === 'business' || v === 'company' || v === 'commercial') return 'business';
    return v;
  }

  private async getUserId(): Promise<string | null> {
    const { data } = await this.supabase.client.auth.getUser();
    return data.user?.id ?? null;
  }

  /**
   * Load minimal current user info (caches result).
   * Call with forceRefresh=true to re-fetch.
   */
  async loadCurrentUser(forceRefresh = false): Promise<User | null> {
    if (!forceRefresh && this._cachedUser !== undefined) return this._cachedUser;

    const userId = await this.getUserId();
    if (!userId) {
      this._cachedUser = null;
      return null;
    }

    const { data, error } = await this.supabase.client
      .from('users')
      .select(`
        id,
        type,
        role,
        first_name,
        last_name,
        avatar_url,
        language,
        theme,
        gender,
        email,
        tel_number,
        id_manager,
        currency:id_currency ( name ),
        country:id_country ( name ),
        goal
      `)
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('loadCurrentUser error:', error);
      this._cachedUser = null;
      return null;
    }

    const country = (data as any).country as any;
    const currency = (data as any).currency as any;

    const user: User = {
      id: data.id,
      type: (this.normalizeType(data.type) || data.type) as UserType,
      role: data.role as UserRole,
      first_name: data.first_name,
      last_name: data.last_name,
      gender: data.gender,
      tel_number: data.tel_number,
      email: data.email,
      country: country?.name || 'N/A',
      currency: currency?.name || 'N/A',
      language: data.language || 'en',
      theme: data.theme as ThemeMode
      // avoid sensitive fields
    } as User;

    this._cachedUser = user;
    return user;
  }

  get cachedUser(): User | null | undefined {
    return this._cachedUser;
  }

  clearUserCache() {
    this._cachedUser = undefined;
  }

  async refreshCurrentUser(): Promise<User | null> {
    return this.loadCurrentUser(true);
  }

  // -------------------------
  // smart account type resolution (cache -> auth metadata -> DB)
  // -------------------------

  /** read type from Supabase auth user metadata (if present) */
  private async getTypeFromAuthMetadata(): Promise<string | null> {
    try {
      const { data } = await this.supabase.client.auth.getUser();
      const authUser = data.user;
      const metaType = authUser?.user_metadata?.['type'];
      return metaType ?? null;
    } catch (e) {
      console.debug('getTypeFromAuthMetadata failed', e);
      return null;
    }
  }

  /**
   * Returns normalized effective account type:
   *  - 'business' | 'personal' | null
   * Strategy: cache -> auth metadata -> users table (cached loader)
   */
  async getEffectiveAccountType(): Promise<'business'|'personal'|null> {
    // 1) cache
    if (this._cachedUser !== undefined && this._cachedUser !== null) {
      const t = String(this._cachedUser.type || '').trim().toLowerCase();
      if (t) return (t === 'business' || t === 'company' || t === 'commercial') ? 'business' : 'personal';
    }

    // 2) auth metadata (cheap, no DB row)
    const meta = await this.getTypeFromAuthMetadata();
    if (meta) {
      const norm = this.normalizeType(meta);
      if (norm === 'business') return 'business';
      if (norm === 'personal') return 'personal';
      // if unknown, continue to DB fallback
    }

    // 3) fallback to users table (loads & caches)
    const loaded = await this.loadCurrentUser();
    if (!loaded || !loaded.type) return null;
    const norm = this.normalizeType(String(loaded.type));
    if (norm === 'business') return 'business';
    if (norm === 'personal') return 'personal';
    return null;
  }

  async isBusinessAccountSmart(): Promise<boolean> {
    const t = await this.getEffectiveAccountType();
    return t === 'business';
  }

  isBusinessCached(): boolean {
    const u = this._cachedUser;
    if (!u) return false;
    const t = String(u.type || '').trim().toLowerCase();
    return t === 'business' || t === 'company' || t === 'commercial';
  }

  // ---------------------------------------------------
  //  FETCHING FROM SUPABASE (unchanged, with small null-safety)
  // ---------------------------------------------------

  async fetchNormalExpenses(): Promise<NormalExpense[]> {
    const userId = await this.getUserId();
    if (!userId) return [];

    const { data, error } = await this.supabase.client
      .from('normal_expenses')
      .select(`
        id,
        name,
        amount,
        date,
        notes,
        receipt,
        category:category_id (
          name
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('fetchNormalExpenses error:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(item => {
      const category = item.category as any;
      return {
        id: item.id,
        name: item.name,
        category: category?.name || 'Uncategorized',
        amount: item.amount,
        date: item.date,
        notes: item.notes,
        receipt: item.receipt
      } as NormalExpense;
    });
  }

  async fetchProductExpenses(): Promise<ProductExpense[]> {
    const userId = await this.getUserId();
    if (!userId) return [];

    const { data, error } = await this.supabase.client
      .from('product_expenses')
      .select(`
        id,
        quantity,
        date,
        notes,
        receipt,
        product:product_id (
          name,
          price
        ),
        category:category_id (
          name
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('fetchProductExpenses error:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(item => {
      const product = item.product as any;
      const category = item.category as any;
      const price = product?.price || 0;
      const quantity = item.quantity || 0;
      return {
        id: item.id,
        productName: product?.name,
        category: category?.name || 'Uncategorized',
        quantity: item.quantity,
        amount: Number(price) * Number(quantity),
        date: item.date,
        notes: item.notes,
        receipt: item.receipt
      } as ProductExpense;
    });
  }

  async fetchIncomeSources(): Promise<IncomeSource[]> {
    const userId = await this.getUserId();
    if (!userId) return [];

    const { data, error } = await this.supabase.client
      .from('income_source')
      .select(`
        id,
        name,
        amount,
        date,
        notes,
        category:id_category (
          name
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('fetchIncomeSources error:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(item => {
      const category = item.category as any;
      return {
        id: item.id,
        name: item.name,
        category: category?.name || 'Uncategorized',
        amount: item.amount,
        date: item.date,
        notes: item.notes
      } as IncomeSource;
    });
  }

  async fetchIncomeProducts(): Promise<IncomeProduct[]> {
    const userId = await this.getUserId();
    if (!userId) return [];

    // First, get the current user's role/type (we could use cached user to avoid the query)
    // Use cached user if loaded to avoid unnecessary DB call.
    let currentUserRow: any = null;
    if (this._cachedUser !== undefined && this._cachedUser !== null) {
      // build a minimal shape like the DB select above
      currentUserRow = { role: this._cachedUser.role, type: this._cachedUser.type };
    } else {
      const { data: cu, error: ue } = await this.supabase.client
        .from('users')
        .select('role, type')
        .eq('id', userId)
        .single();
      if (ue) {
        console.error('fetchCurrentUser error:', ue);
        return [];
      }
      currentUserRow = cu;
    }

    if (currentUserRow.role !== 'admin') {
      console.warn('Access denied: Only admins can fetch income products');
      return [];
    }

    const { data: employees, error: employeesError } = await this.supabase.client
      .from('users')
      .select('id')
      .eq('id_manager', userId);

    if (employeesError) {
      console.error('fetchEmployees error:', employeesError);
    }

    const employeeIds = (employees || []).map((emp: any) => emp.id);
    const allUserIds = [userId, ...employeeIds];

    const { data, error } = await this.supabase.client
      .from('income_product')
      .select(`
        id,
        quantity,
        date,
        scan_type,
        notes,
        paymentMethod,
        product:product_id (
          name,
          price,
          category:id_category (
            name
          )
        ),
        user:user_id (
          first_name,
          last_name
        )
      `)
      .in('user_id', allUserIds);

    if (error) {
      console.error('fetchIncomeProducts error:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(item => {
      const product = item.product as any;
      const category = product?.category as any;
      const user = item.user as any;
      const price = product?.price || 0;
      const quantity = item.quantity || 0;
      return {
        id: item.id,
        product: product?.name || 'Unknown',
        category: category?.name || 'Uncategorized',
        amount: Number(price) * Number(quantity),
        quantity: item.quantity,
        date: item.date,
        scan_type: item.scan_type,
        notes: item.notes,
        employeeName: user ? `${user.first_name} ${user.last_name}` : 'Unknown',
        paymentMethod: item.paymentMethod
      } as IncomeProduct;
    });
  }

  async fetchIncomes(): Promise<Income[]> {
    const incomeSources = await this.fetchIncomeSources();
    const incomeProducts = await this.fetchIncomeProducts();
    return [...incomeSources, ...incomeProducts] as Income[];
  }

  async fetchExpenses(): Promise<Expense[]> {
    const normalExpenses = await this.fetchNormalExpenses();
    const productExpenses = await this.fetchProductExpenses();
    return [...normalExpenses, ...productExpenses] as Expense[];
  }

  async fetchCategories(): Promise<Category[]> {
    const userId = await this.getUserId();
    if (!userId) return [];

    const { data, error } = await this.supabase.client
      .from('category')
      .select('*')
      .or(`user_id.eq.${userId},user_id.is.null`);

    if (error) {
      console.error('fetchCategories error:', error);
      return [];
    }

    return data as Category[];
  }

  async fetchProducts(): Promise<Product[]> {
    const userId = await this.getUserId();
    if (!userId) return [];

    const { data, error } = await this.supabase.client
      .from('product')
      .select(`
        id,
        name,
        price,
        barcode,
        description,
        category:id_category (
          name
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('fetchProducts error:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(item => {
      const category = item.category as any;
      return {
        id: item.id,
        name: item.name,
        category: category?.name || 'Uncategorized',
        price: item.price,
        barcode: item.barcode,
        description: item.description
      } as Product;
    });
  }

  // ---------------------------------------------------
  //  MONTHLY TOTALS
  // ---------------------------------------------------
  async monthlyTotalsIncome(year: number, incomes: Income[]): Promise<MonthlyPoint[]> {
    const buckets = new Array(12).fill(0);
    incomes.forEach(i => {
      const d = new Date(i.date);
      if (d.getFullYear() === year) buckets[d.getMonth()] += i.amount;
    });
    return buckets.map((amount, idx) => ({ month: this.months[idx], amount: Math.round(amount) }));
  }

  async monthlyTotalsExpenses(year: number, expenses: Expense[]): Promise<MonthlyPoint[]> {
    const buckets = new Array(12).fill(0);
    expenses.forEach(e => {
      const d = new Date(e.date);
      if (d.getFullYear() === year) buckets[d.getMonth()] += e.amount;
    });
    return buckets.map((amount, idx) => ({ month: this.months[idx], amount: Math.round(amount) }));
  }

  async monthlyNetBalance(year: number, incomes: Income[], expenses: Expense[]): Promise<MonthlyPoint[]> {
    const inc = await this.monthlyTotalsIncome(year, incomes);
    const exp = await this.monthlyTotalsExpenses(year, expenses);
    return inc.map((m, i) => ({ month: m.month, amount: Math.round(m.amount - exp[i].amount) }));
  }

  // ---------------------------------------------------
  //  CATEGORY DISTRIBUTION
  // ---------------------------------------------------
  async categoryDistribution(elements: (Income | Expense)[], categories: Category[]): Promise<CategorySlice[]> {
    const categoryMap = new Map<string, number>();
    elements.forEach(element => {
      const categoryName = element.category || 'Uncategorized';
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + element.amount);
    });
    const result: CategorySlice[] = [];
    for (const [categoryName, value] of categoryMap.entries()) {
      const category = categories.find(c => c.name === categoryName);
      result.push({ label: categoryName, value: Math.round(value), color: category?.color || '#ccc' });
    }
    return result.sort((a, b) => b.value - a.value).slice(0, 5);
  }

  // ---------------------------------------------------
  //  OVERVIEW HELPERS (daily / monthly)
  // ---------------------------------------------------
  private formatDay(d: Date | string): string {
    const dt = (d instanceof Date) ? d : new Date(d);
    return dt.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
  }

  private formatMonthYear(year: number, monthIndex: number): string {
    return `${this.months[monthIndex]} ${year}`;
  }

  private dateKey(dateString: string | Date): string {
    const d = (dateString instanceof Date) ? dateString : new Date(dateString);
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private lastNDates(n: number): Date[] {
    const arr: Date[] = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      arr.push(d);
    }
    return arr;
  }

  private dailyOverviewFromRecords(data: { date: string; amount: number }[], days: number) {
    const daysArr = this.lastNDates(days);
    const map = new Map<string, number>();
    daysArr.forEach(d => map.set(this.dateKey(d), 0));
    data.forEach(item => {
      const k = this.dateKey(item.date);
      if (map.has(k)) map.set(k, (map.get(k) || 0) + item.amount);
    });
    return daysArr.map(d => {
      const key = this.dateKey(d);
      return { date: this.formatDay(d), amount: Math.round(map.get(key) || 0) };
    });
  }

  private last12MonthsOverviewFromRecords(data: { date: string; amount: number }[]) {
    const now = new Date();
    const monthsArr: { year: number; monthIndex: number; key: string }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      monthsArr.push({ year: d.getFullYear(), monthIndex: d.getMonth(), key });
    }
    const map = new Map<string, number>();
    monthsArr.forEach(m => map.set(m.key, 0));
    data.forEach(item => {
      const d = new Date(item.date);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      if (map.has(key)) map.set(key, (map.get(key) || 0) + item.amount);
    });
    return monthsArr.map(m => ({ date: this.formatMonthYear(m.year, m.monthIndex), amount: Math.round(map.get(m.key) || 0) }));
  }

  // ---------------------------------------------------
  //  PUBLIC API FOR CHARTS
  // ---------------------------------------------------
  async getIncomeOverview(mode: 'weekly' | 'monthly' | 'yearly') {
    const incomes = await this.fetchIncomes();
    const raw = incomes.map(i => ({ date: i.date, amount: i.amount }));
    if (mode === 'yearly') return this.last12MonthsOverviewFromRecords(raw);
    if (mode === 'weekly') return this.dailyOverviewFromRecords(raw, 7);
    return this.dailyOverviewFromRecords(raw, 28);
  }

  async getExpenseOverview(mode: 'weekly' | 'monthly' | 'yearly') {
    const expenses = await this.fetchExpenses();
    const raw = expenses.map(e => ({ date: e.date, amount: e.amount }));
    if (mode === 'yearly') return this.last12MonthsOverviewFromRecords(raw);
    if (mode === 'weekly') return this.dailyOverviewFromRecords(raw, 7);
    return this.dailyOverviewFromRecords(raw, 28);
  }

  // ---------------------------------------------------
  //  other helpers (best selling, employees, stats)
  // ---------------------------------------------------
  async fetchBestSellingProducts(): Promise<CategorySlice[]> {
    const userId = await this.getUserId();
    if (!userId) return [];

    // safer two-step approach might be required depending on PostgREST config,
    // but keep original pattern for simplicity
    const { data, error } = await this.supabase.client
      .from('income_product')
      .select(`
        quantity,
        product:product_id (
          name,
          user_id
        )
      `)
      .eq('product.user_id', userId);

    if (error) {
      console.error('fetchBestSellingProducts error:', error);
      return [];
    }

    if (!data || data.length === 0) return [];

    const productMap = new Map<string, number>();
    data.forEach(item => {
      const product = item.product as any;
      const productName = product?.name || 'Unknown';
      const quantity = Number(item.quantity || 0);
      productMap.set(productName, (productMap.get(productName) || 0) + quantity);
    });

    const getRandomVibrantColor = (): string => {
      const r = Math.floor(Math.random() * 180) + 50;
      const g = Math.floor(Math.random() * 180) + 50;
      const b = Math.floor(Math.random() * 180) + 50;
      const max = Math.max(r, g, b);
      if (max < 150) {
        const channels = [r, g, b];
        const boostIndex = Math.floor(Math.random() * 3);
        channels[boostIndex] = Math.floor(Math.random() * 80) + 170;
        return `rgb(${channels[0]}, ${channels[1]}, ${channels[2]})`;
      }
      return `rgb(${r}, ${g}, ${b})`;
    };

    return Array.from(productMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value]) => ({ label, value, color: getRandomVibrantColor() }));
  }

  async fetchActiveEmployeesToday(): Promise<number> {
    const userId = await this.getUserId();
    if (!userId) return 0;

    const { data: employees } = await this.supabase.client
      .from('users')
      .select('id')
      .eq('id_manager', userId);

    if (!employees) return 0;
    const employeeIds = employees.map((e: any) => e.id);

    const today = new Date();
    today.setHours(0,0,0,0);

    const { data } = await this.supabase.client
      .from('income_product')
      .select('user_id')
      .in('user_id', employeeIds)
      .gte('date', today.toISOString());

    const activeEmployeeIds = new Set((data || []).map((d: any) => d.user_id));
    return activeEmployeeIds.size;
  }

  async fetchTotalEmployees(): Promise<number> {
    const userId = await this.getUserId();
    if (!userId) return 0;

    const { count, error } = await this.supabase.client
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('id_manager', userId);

    if (error) {
      console.error('fetchTotalEmployees error:', error);
      return 0;
    }

    return count || 0;
  }

  async fetchEmployeeOfTheMonth(): Promise<{ name: string; avatar_url?: string } | null> {
    const userId = await this.getUserId();
    if (!userId) return null;

    const { data: employees, error: employeesError } = await this.supabase.client
      .from('users')
      .select('id, first_name, last_name, avatar_url')
      .eq('id_manager', userId);

    if (employeesError || !employees || employees.length === 0) {
      console.error('fetchEmployees error:', employeesError);
      return null;
    }

    const employeeIds = employees.map((emp: any) => emp.id);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const { data: incomeProducts, error } = await this.supabase.client
      .from('income_product')
      .select(`
        user_id,
        quantity,
        product:product_id (
          price
        )
      `)
      .in('user_id', employeeIds)
      .gte('date', startOfMonth.toISOString());

    if (error) {
      console.error('fetchEmployeeOfTheMonth error:', error);
      return null;
    }

    if (!incomeProducts || incomeProducts.length === 0) return null;

    const employeeSales = new Map<string, number>();
    incomeProducts.forEach((item: any) => {
      const product = item.product as any;
      const price = Number(product?.price || 0);
      const quantity = Number(item.quantity || 0);
      const revenue = price * quantity;
      employeeSales.set(item.user_id, (employeeSales.get(item.user_id) || 0) + revenue);
    });

    let topEmployeeId: string | null = null;
    let maxSales = 0;
    for (const [empId, sales] of employeeSales.entries()) {
      if (sales > maxSales) {
        maxSales = sales;
        topEmployeeId = empId;
      }
    }

    if (!topEmployeeId) return null;
    const topEmployee = employees.find((emp: any) => emp.id === topEmployeeId);
    if (!topEmployee) return null;
    return { name: `${topEmployee.first_name} ${topEmployee.last_name}`, avatar_url: topEmployee.avatar_url };
  }

  async fetchAverageSalesPerEmployee(): Promise<number> {
    const userId = await this.getUserId();
    if (!userId) return 0;

    const { data: employees, error: employeesError } = await this.supabase.client
      .from('users')
      .select('id')
      .eq('id_manager', userId);

    if (employeesError || !employees || employees.length === 0) {
      console.error('fetchEmployees error:', employeesError);
      return 0;
    }

    const employeeIds = employees.map((emp: any) => emp.id);
    const totalEmployees = employees.length;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const { data: incomeProducts, error } = await this.supabase.client
      .from('income_product')
      .select(`
        quantity,
        product:product_id (
          price
        )
      `)
      .in('user_id', employeeIds)
      .gte('date', startOfMonth.toISOString());

    if (error) {
      console.error('fetchAverageSalesPerEmployee error:', error);
      return 0;
    }

    if (!incomeProducts || incomeProducts.length === 0) return 0;

    let totalSales = 0;
    incomeProducts.forEach((item: any) => {
      const product = item.product as any;
      const price = Number(product?.price || 0);
      const quantity = Number(item.quantity || 0);
      totalSales += price * quantity;
    });

    const average = totalSales / totalEmployees;
    return Math.round(average);
  }

  async fetchGenderDistribution(): Promise<{ label: string; value: number; color: string }[]> {
    const userId = await this.getUserId();
    if (!userId) return [];

    const { data: employees, error } = await this.supabase.client
      .from('users')
      .select('gender')
      .eq('id_manager', userId);

    if (error || !employees) {
      console.error('fetchGenderDistribution error:', error);
      return [];
    }

    const genderCount = new Map<string, number>([['Male', 0], ['Female', 0]]);
    employees.forEach((emp: any) => {
      const gender = emp.gender;
      if (gender === 'Male' || gender === 'Female') {
        genderCount.set(gender, (genderCount.get(gender) || 0) + 1);
      }
    });

    const genderColors: { [key: string]: string } = { 'Male': '#3B82F6', 'Female': '#EC4899' };
    const genderLabels: { [key: string]: string } = { 'Male': 'Men', 'Female': 'Women' };

    return Array.from(genderCount.entries()).map(([key, value]) => ({ label: genderLabels[key], value, color: genderColors[key] }));
  }

  async fetchEmployees(): Promise<User[]> {
    const userId = await this.getUserId();
    if (!userId) return [];

    const { data, error } = await this.supabase.client
      .from('users')
      .select(`
        id,
        type,
        role,
        first_name,
        last_name,
        tel_number,
        email,
        language,
        theme,
        gender,
        country:id_country (
          name
        ),
        currency:id_currency (
          name
        )
      `)
      .eq('id_manager', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('fetchEmployees error:', error);
      return [];
    }

    if (!data || data.length === 0) return [];

    return data.map((emp: any) => {
      const country = emp.country as any;
      const currency = emp.currency as any;
      return {
        id: emp.id,
        type: emp.type as UserType,
        role: emp.role as UserRole,
        first_name: emp.first_name,
        last_name: emp.last_name,
        gender: emp.gender,
        tel_number: emp.tel_number,
        email: emp.email,
        country: country?.name || 'N/A',
        currency: currency?.name || 'N/A',
        language: emp.language || 'en',
        theme: emp.theme as ThemeMode
      } as User;
    });
  }

  async fetchGoal(): Promise<number | null> {
    const userId = await this.getUserId();
    if (!userId) return null;

    const { data, error } = await this.supabase.client
      .from('users')
      .select('goal')
      .eq('id', userId)
      .single();

    if (error || !data) {
      console.error('fetchGoal error:', error);
      return null;
    }

    return data.goal ? Number(data.goal) : null;
  }



// Ajouter une transaction pour un employé
async addEmployeeTransaction(trx: { productId: string; quantity: number; notes?: string }) {
  if (!this.cachedUser?.id) throw new Error('No user logged in');

  // Récupérer le produit pour calculer le montant
  const { data: product, error } = await this.supabase.client
    .from('product')
    .select('*')
    .eq('id', trx.productId)
    .single();
  if (error || !product) throw new Error('Product not found');

  const amount = product.price * trx.quantity;

  const { data, error: insertError } = await this.supabase.client
    .from('income')
    .insert([{
      name: `Sale: ${product.name}`,
      amount,
      quantity: trx.quantity,
      date: new Date(),
      product_id: trx.productId,
      user_id: this.cachedUser.id,
      type: 'product',
      notes: trx.notes || ''
    }]);
  
  if (insertError) throw insertError;
  return data;
}


async fetchLastEmployeeTransactions(limit = 10) {
  if (!this.cachedUser?.id) return [];

  const { data, error } = await this.supabase.client
    .from('income')
    .select('id, name, amount, quantity, date, notes, product_id')
    .eq('user_id', this.cachedUser.id)
    .eq('type', 'product')  // Seulement les transactions produit
    .order('date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}


async isEmployee(): Promise<boolean> {
  const user = await this.loadCurrentUser();
  return !!user && user.role === UserRole.EMPLOYEE;
}

isEmployeeCached(): boolean {
  const u = this._cachedUser;
  return !!u && u.role === UserRole.EMPLOYEE;
}

async isAdmin(): Promise<boolean> {
  const user = await this.loadCurrentUser();
  return !!user && user.role === UserRole.ADMIN;
}

isAdminCached(): boolean {
  const u = this._cachedUser;
  return !!u && u.role === UserRole.ADMIN;
}



}
