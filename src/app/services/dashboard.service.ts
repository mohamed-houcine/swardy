// dashboard.service.ts (updated overview helpers for 7d / 28d / 12m)
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

  constructor(public supabase: SupabaseService) {}

  private months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // ---------------------------------------------------
  //  FETCHING FROM SUPABASE (unchanged)
  // ---------------------------------------------------
  private async getUserId(): Promise<string | null> {
    const { data } = await this.supabase.client.auth.getUser();
    return data.user?.id ?? null;
  }

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

    // Transform the data to match your NormalExpense model
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

    // Transform the data to match your ProductExpense model
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

    // Transform the data to match your IncomeSource model
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


    // First, get the current user to check their role
    const { data: currentUser, error: userError } = await this.supabase.client
      .from('users')
      .select('role, type')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('fetchCurrentUser error:', userError);
      return [];
    }

    // Only admins can fetch income products
    if (currentUser.role !== 'admin') {
      console.warn('Access denied: Only admins can fetch income products');
      return [];
    }

    // Get all employees supervised by this admin
    const { data: employees, error: employeesError } = await this.supabase.client
      .from('users')
      .select('id')
      .eq('id_manager', userId);

    if (employeesError) {
      console.error('fetchEmployees error:', employeesError);
    }
    
    const employeeIds = (employees || []).map(emp => emp.id);
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

    // Transform the data to match your IncomeProduct model
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

    // Transform the data to match your Product model
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
  //  MONTHLY TOTALS (unchanged)
  // ---------------------------------------------------
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

  async monthlyNetBalance(year: number, incomes: Income[], expenses: Expense[]): Promise<MonthlyPoint[]> {
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
  async categoryDistribution(elements: (Income | Expense)[], categories: Category[]): Promise<CategorySlice[]> {
    // Create a map to aggregate amounts by category
    const categoryMap = new Map<string, number>();
    
    elements.forEach(element => {
      const categoryName = element.category || 'Uncategorized';
      categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + element.amount);
    });
    
    // Transform to CategorySlice array
    const result: CategorySlice[] = [];
    
    for (const [categoryName, value] of categoryMap.entries()) {
      const category = categories.find(c => c.name === categoryName);
      
      result.push({
        label: categoryName,
        value: Math.round(value),
        color: category?.color || '#ccc'
      });
    }
    return result.sort((a, b) => b.value - a.value).slice(0, 5);
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

  async fetchBestSellingProducts(): Promise<CategorySlice[]> {
    const userId = await this.getUserId();
    if (!userId) return [];

    // Fetch income products with product details
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

    if (!data || data.length === 0) {
      return [];
    }

    // Aggregate by product
    const productMap = new Map<string, number>();

    data.forEach(item => {
      const product = item.product as any;
      const productName = product?.name || 'Unknown';
      const quantity = Number(item.quantity || 0);

      productMap.set(productName, (productMap.get(productName) || 0) + quantity);
    });

    // Helper function to generate vibrant random colors
    const getRandomVibrantColor = (): string => {
      // Generate RGB values in the range 50-230 to avoid very dark/light colors
      const r = Math.floor(Math.random() * 180) + 50;
      const g = Math.floor(Math.random() * 180) + 50;
      const b = Math.floor(Math.random() * 180) + 50;
      
      // Ensure it's vibrant (at least one channel is high)
      const max = Math.max(r, g, b);
      if (max < 150) {
        // Boost one random channel to make it more vibrant
        const channels = [r, g, b];
        const boostIndex = Math.floor(Math.random() * 3);
        channels[boostIndex] = Math.floor(Math.random() * 80) + 170;
        return `rgb(${channels[0]}, ${channels[1]}, ${channels[2]})`;
      }
      
      return `rgb(${r}, ${g}, ${b})`;
    };

    // Convert to array, sort by quantity, take top 5, and add random colors
    return Array.from(productMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, value]) => ({
        label,
        value,
        color: getRandomVibrantColor()
      }));
  }

  async fetchActiveEmployeesToday(): Promise<number> {
    const userId = await this.getUserId();
    if (!userId) return 0;

    // Get employees
    const { data: employees } = await this.supabase.client
      .from('users')
      .select('id')
      .eq('id_manager', userId);

    if (!employees) return 0;

    const employeeIds = employees.map(e => e.id);
    
    // Get today's start
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check who made transactions today
    const { data } = await this.supabase.client
      .from('income_product')
      .select('user_id')
      .in('user_id', employeeIds)
      .gte('date', today.toISOString());

    // Get unique employee IDs who were active
    const activeEmployeeIds = new Set(data?.map(d => d.user_id));
    
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

  async fetchEmployeeOfTheMonth(): Promise<{
    name: string;
    avatar_url?: string;
  } | null> {
    const userId = await this.getUserId();
    if (!userId) return null;

    // Get all employees supervised by this admin
    const { data: employees, error: employeesError } = await this.supabase.client
      .from('users')
      .select('id, first_name, last_name, avatar_url')
      .eq('id_manager', userId);

    if (employeesError || !employees || employees.length === 0) {
      console.error('fetchEmployees error:', employeesError);
      return null;
    }

    const employeeIds = employees.map(emp => emp.id);

    // Get start of current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch income products for this month
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

    if (!incomeProducts || incomeProducts.length === 0) {
      return null;
    }

    // Calculate total sales per employee
    const employeeSales = new Map<string, number>();

    incomeProducts.forEach(item => {
      const product = item.product as any;
      const price = Number(product?.price || 0);
      const quantity = Number(item.quantity || 0);
      const revenue = price * quantity;

      employeeSales.set(item.user_id, (employeeSales.get(item.user_id) || 0) + revenue);
    });

    // Find employee with highest sales
    let topEmployeeId: string | null = null;
    let maxSales = 0;

    for (const [empId, sales] of employeeSales.entries()) {
      if (sales > maxSales) {
        maxSales = sales;
        topEmployeeId = empId;
      }
    }

    if (!topEmployeeId) {
      return null;
    }

    // Get employee details
    const topEmployee = employees.find(emp => emp.id === topEmployeeId);

    if (!topEmployee) {
      return null;
    }

    return {
      name: `${topEmployee.first_name} ${topEmployee.last_name}`,
      avatar_url: topEmployee.avatar_url
    };
  }

  async fetchAverageSalesPerEmployee(): Promise<number> {
    const userId = await this.getUserId();
    if (!userId) return 0;

    // Get all employees supervised by this admin
    const { data: employees, error: employeesError } = await this.supabase.client
      .from('users')
      .select('id')
      .eq('id_manager', userId);

    if (employeesError || !employees || employees.length === 0) {
      console.error('fetchEmployees error:', employeesError);
      return 0;
    }

    const employeeIds = employees.map(emp => emp.id);
    const totalEmployees = employees.length;

    // Get start of current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch income products for this month
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

    if (!incomeProducts || incomeProducts.length === 0) {
      return 0;
    }

    // Calculate total sales
    let totalSales = 0;

    incomeProducts.forEach(item => {
      const product = item.product as any;
      const price = Number(product?.price || 0);
      const quantity = Number(item.quantity || 0);
      totalSales += price * quantity;
    });

    // Calculate average
    const average = totalSales / totalEmployees;

    return Math.round(average);
  }

  async fetchGenderDistribution(): Promise<{ label: string; value: number; color: string }[]> {
    const userId = await this.getUserId();
    if (!userId) return [];

    // Get all employees supervised by this admin
    const { data: employees, error } = await this.supabase.client
      .from('users')
      .select('gender')
      .eq('id_manager', userId);

    if (error || !employees) {
      console.error('fetchGenderDistribution error:', error);
      return [];
    }
    console.log(employees);
    // Initialize both genders with 0
    const genderCount = new Map<string, number>([
      ['Male', 0],
      ['Female', 0]
    ]);

    // Count by gender
    employees.forEach(emp => {
      const gender = emp.gender;
      if (gender === 'Male' || gender === 'Female') {
        genderCount.set(gender, (genderCount.get(gender) || 0) + 1);
      }
    });

    // Gender color mapping
    const genderColors: { [key: string]: string } = {
      'Male': '#3B82F6',     // Blue
      'Female': '#EC4899'    // Pink
    };

    const genderLabels: { [key: string]: string } = {
      'Male': 'Men',
      'Female': 'Women'
    };

    // Transform to array with label, count, and color
    const result = Array.from(genderCount.entries()).map(([key, value]) => ({
      label: genderLabels[key],
      value,
      color: genderColors[key]
    }));

    return result;
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

    if (!data || data.length === 0) {
      return [];
    }

    // Transform the data to match your User model
    return data.map(emp => {
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

}
