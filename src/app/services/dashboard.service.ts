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
import { AuthService } from '../core/auth/auth.service';

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

  constructor(public supabase: SupabaseService, public auth: AuthService) {}

  private months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // ---------------------------------------------------
  //  FETCHING FROM SUPABASE (unchanged)
  // ---------------------------------------------------
  async getUserId(): Promise<string | null> {
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
      .eq('user_id', userId)
      .order('date', { ascending: false });

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

      const formattedDate = item.date
        ? new Date(item.date).toISOString().split('T')[0]
        : '';

      return {
        id: item.id,
        name: item.name,
        category: category?.name || 'Uncategorized',
        amount: item.amount,
        date: formattedDate,   // ✅ formatted here
        notes: item.notes,
        receipt: item.receipt
      } as NormalExpense;
    });

  }

  async fetchProductExpenses(): Promise<ProductExpense[]> {
    const userId = await this.getUserId();
    if (!userId) return [];

    // Fetch product expenses with product and its category name
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
          price,
          id_category (
            name
          )
        )
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('fetchProductExpenses error:', error);
      return [];
    }

    if (!data || data.length === 0) return [];

    // Transform the data
    return data.map(item => {
      const product = item.product as any;
      const category = product?.id_category as any;
      const price = product?.price || 0;
      const quantity = item.quantity || 0;

      const formattedDate = item.date
        ? new Date(item.date).toISOString().split('T')[0]
        : '';

      return {
        id: item.id,
        productName: product?.name,
        category: category?.name || 'Uncategorized', // ✅ category name
        quantity: item.quantity,
        amount: Number(price) * Number(quantity),
        date: formattedDate,
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
      .eq('user_id', userId)
      .order('date', { ascending: false });

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

      const formattedDate = item.date
        ? new Date(item.date).toISOString().split('T')[0]
        : '';

      return {
        id: item.id,
        name: item.name,
        category: category?.name || 'Uncategorized',
        amount: item.amount,
        date: formattedDate,
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
    if (currentUser.role !== 'Admin') {
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
      .in('user_id', allUserIds)
      .order('date', { ascending: false });

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

      const formattedDate = item.date
        ? new Date(item.date).toISOString().split('T')[0]
        : '';

      return {
        id: item.id,
        product: product?.name || 'Unknown',
        category: category?.name || 'Uncategorized',
        amount: Number(price) * Number(quantity),
        quantity: item.quantity,
        date: formattedDate,   // ✅ formatted here
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

  async fetchProductsByCategory(categoryId: string): Promise<Product[]> {
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
          id,
          name
        )
      `)
      .eq('user_id', userId)
      .eq('id_category', categoryId); // ✅ filter by FK column

    if (error) {
      console.error('fetchProductsByCategory error:', error);
      return [];
    }

    return (data || []).map(item => {
      const category = item.category as any;

      return {
        id: item.id,
        name: item.name,
        category: category?.name ?? 'Uncategorized',
        price: item.price,
        barcode: item.barcode,
        description: item.description
      } as Product;
    });
  }

  



// Ajouter ces fonctions dans dashboard.service.ts

/**
 * Récupère l'ID du manager de l'utilisateur connecté
 * @returns L'ID du manager (UUID) ou null si pas de manager
 */
async getManagerId(): Promise<string | null> {
  const userId = await this.getUserId();
  if (!userId) {
    console.warn('getManagerId: No user logged in');
    return null;
  }

  // Si l'utilisateur est déjà en cache et a un manager
  if (this._cachedUser && this._cachedUser.id_manager) {
    return this._cachedUser.id_manager;
  }

  // Sinon, fetch depuis la base de données
  const { data, error } = await this.supabase.client
    .from('users')
    .select('id_manager')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('getManagerId error:', error);
    return null;
  }

  return data?.id_manager ?? null;
}

/**
 * Récupère les produits par catégorie du MANAGER de l'employé
 * Utile pour les employés qui doivent vendre les produits de leur manager
 * @param categoryId L'ID de la catégorie
 * @returns Liste des produits du manager dans cette catégorie
 */
async fetchManagerProductsByCategory(categoryId: string): Promise<Product[]> {
  const managerId = await this.getManagerId();
  
  if (!managerId) {
    console.warn('fetchManagerProductsByCategory: No manager found');
    return [];
  }

  const { data, error } = await this.supabase.client
    .from('product')
    .select(`
      id,
      name,
      price,
      barcode,
      description,
      category:id_category (
        id,
        name
      )
    `)
    .eq('user_id', managerId)  // Produits du MANAGER
    .eq('id_category', categoryId);  // Filtrer par ID de catégorie

  if (error) {
    console.error('fetchManagerProductsByCategory error:', error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  return data.map(item => {
    const categoryData = item.category as any;
    return {
      id: item.id,
      name: item.name,
      category: categoryData?.name || 'Uncategorized',
      price: item.price,
      barcode: item.barcode,
      description: item.description
    } as Product;
  });
}

/**
 * Récupère TOUS les produits du manager (sans filtre de catégorie)
 * @returns Liste de tous les produits du manager
 */
async fetchAllManagerProducts(): Promise<Product[]> {
  const managerId = await this.getManagerId();
  
  if (!managerId) {
    console.warn('fetchAllManagerProducts: No manager found');
    return [];
  }

  const { data, error } = await this.supabase.client
    .from('product')
    .select(`
      id,
      name,
      price,
      barcode,
      description,
      category:id_category (
        id,
        name
      )
    `)
    .eq('user_id', managerId)  // Produits du MANAGER
    .order('name', { ascending: true });

  if (error) {
    console.error('fetchAllManagerProducts error:', error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  return data.map(item => {
    const categoryData = item.category as any;
    return {
      id: item.id,
      name: item.name,
      category: categoryData?.name || 'Uncategorized',
      price: item.price,
      barcode: item.barcode,
      description: item.description
    } as Product;
  });
}

/**
 * Récupère les catégories disponibles du manager
 * Utile pour afficher les catégories dans un dropdown pour l'employé
 * @returns Liste des catégories du manager
 */
async fetchManagerCategoriesByType(
  type: 'income' | 'expense' | 'product'
): Promise<{ id: string; name: string; color?: string }[]> {
  const managerId = await this.getManagerId();
  
  if (!managerId) {
    console.warn('fetchManagerCategoriesByType: No manager found');
    return [];
  }

  const { data, error } = await this.supabase.client
    .from('category')
    .select('id, name, color, type, user_id')
    .or(`user_id.eq.${managerId},user_id.is.null`)  // Catégories du manager + globales
    .or(`type.eq.${type},type.eq.all`)  // Type spécifique ou 'all'
    .order('name', { ascending: true });

  if (error) {
    console.error('fetchManagerCategoriesByType error:', error);
    return [];
  }

  return (data || []).map(cat => ({
    id: cat.id,
    name: cat.name,
    color: cat.color
  }));
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

  async addIncomeSource(source: any) {
    const userId = await this.getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await this.supabase.client
      .from('income_source')
      .insert([{
        name: source.name,
        id_category: source.category,
        amount: source.amount,
        date: source.date,
        notes: source.notes ?? null,
        user_id: userId
      }])
      .select()
      .single();

    if (error) {
      console.log(error);
    }

    return data;
  }

  async fetchCategoriesByType(
    type: 'income' | 'expense' | 'product'
  ): Promise<{ id: string; name: string }[]> {

    const { data, error } = await this.supabase.client
      .from('category')
      .select('id, name, type')
      .or(`type.eq.${type},type.eq.all`)
      .order('name', { ascending: true });

    if (error) {
      console.error('fetchCategoriesByType error:', error);
      return [];
    }

    return data ?? [];
  }

  async addCategory(category: Category, type: 'income' | 'expense' | 'product') {
    const userId = await this.getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Check if a category with the same name and type 'all' already exists
    const { data: existingCategory, error: checkError } = await this.supabase.client
      .from('category')
      .select('id, name, type')
      .eq('name', category.name)
      .or(`user_id.eq.${userId},user_id.is.null`) // Check both user's categories and global ones
      .or(`type.eq.all,type.eq.${type}`) // Check if type is 'all' or matches the new type
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking existing category:', checkError);
    }

    // If a category with type 'all' or same type exists, don't insert
    if (existingCategory) {
      if (existingCategory.type === 'all') {
        throw new Error(`Category "${category.name}" already exists with type "all"`);
      }
      if (existingCategory.type === type) {
        throw new Error(`Category "${category.name}" already exists with type "${type}"`);
      }
    }

    // Insert new category
    const { data, error } = await this.supabase.client
      .from('category')
      .insert([{
        name: category.name,
        color: category.color ?? null,
        user_id: userId,
        type: type
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async addGoal(goal: number): Promise<void> {
    const userId = await this.getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await this.supabase.client
      .from('users')
      .update({ goal: goal })
      .eq('id', userId)
      .select('id, goal')
      .single();

    if (error) {
      throw new Error(`Failed to set goal: ${error.message}`);
    }

    console.log('✅ Goal set successfully:', data);
  }

  async addNormalExpense(expense: any, file: File | null) {
    const userId = await this.getUserId();
    if (!userId) throw new Error("User not logged in");

    let receiptUrl: string | null = null;

    // Optional: upload receipt file to Supabase Storage
    if (file) {
      // Create unique filename to avoid conflicts
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await this.supabase.client
        .storage
        .from('expense-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = this.supabase.client.storage
        .from('expense-images')
        .getPublicUrl(fileName);

      receiptUrl = urlData.publicUrl;
    }

    const { data, error } = await this.supabase.client
      .from('normal_expenses')
      .insert([{
        amount: expense.amount,
        date: expense.date,
        notes: expense.notes ?? null,
        receipt: receiptUrl,
        category_id: expense.category,
        name: expense.name,
        user_id: userId
      }])
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      throw error;
    }

    return data;
  }

  async addExpenseProduct(product: any, file: File | null) {
    const userId = await this.getUserId();
    if (!userId) throw new Error("User not logged in");

    let receiptUrl: string | null = null;

    // Optional: upload receipt file to Supabase Storage
    if (file) {
      // Create unique filename to avoid conflicts
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await this.supabase.client
        .storage
        .from('expense-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = this.supabase.client.storage
        .from('expense-images')
        .getPublicUrl(fileName);

      receiptUrl = urlData.publicUrl;
    }

    // Insert the new expense product into the table
    const { data, error } = await this.supabase.client
      .from('product_expenses') // <-- change table to your product table
      .insert([{
        product_id: product.product,
        quantity: product.quantity,
        date: product.date,
        notes: product.notes ?? null,
        receipt: receiptUrl,
        user_id: userId
      }])
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      throw error;
    }

    return data;
  }


  async addProduct(product: {name: string, category: string, price: number, description: string}) {
    const userId = await this.getUserId();
    if (!userId) throw new Error("User not logged in");

    const barcode = Date.now().toString();

    const { data, error } = await this.supabase.client
      .from('product')
      .insert([{
        name: product.name,
        id_category: product.category,
        price: product.price,
        barcode: barcode ?? null,
        description: product.description ?? null,
        user_id: userId
      }])
      .select()
      .single();

    if (error) throw error;

    return data;
  }












  private _cachedUser: User | null | undefined = undefined;


  private normalizeType(raw?: string | null): string | null {
    if (!raw) return null;
    const v = raw.trim().toLowerCase();
    if (v === 'personnel' || v === 'personal' || v === 'private') return 'personal';
    if (v === 'business' || v === 'company' || v === 'commercial') return 'business';
    return v;
  }

// dashboard.service.ts - Fixed loadCurrentUser method

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
    theme: data.theme as ThemeMode,
    id_manager: data.id_manager,
    avatar_url: data.avatar_url,  // ✅ ADDED: Include avatar_url from database
    goal: data.goal ? Number(data.goal) : undefined  // ✅ ADDED: Include goal
  };

  this._cachedUser = user;
  return user;
}

  get cachedUser(): User | null | undefined {
    return this._cachedUser;
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
  const userId = await this.getUserId();
  if (!userId) return [];

  // Vérifier que l'utilisateur est un employé
  const user = await this.loadCurrentUser();
  if (!user || user.role !== 'Employee') {
    console.warn('Access denied: Only employees can fetch their own transactions');
    return [];
  }

  // Fetch ONLY income products created by THIS employee (user_id = current user)
  const { data, error } = await this.supabase.client
    .from('income_product')
    .select(`
      id,
      quantity,
      date,
      notes,
      product:product_id (
        name,
        price
      )
    `)
    .eq('user_id', userId)  // IMPORTANT: Only this employee's transactions
    .order('date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('fetchLastEmployeeTransactions error:', error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  // Transform to match expected format
  return data.map(item => {
    const product = item.product as any;
    const price = Number(product?.price || 0);
    const quantity = Number(item.quantity || 0);
    
    return {
      id: item.id,
      name: `Sale: ${product?.name || 'Unknown Product'}`,
      amount: price * quantity,
      quantity: item.quantity,
      date: item.date,
      notes: item.notes || '',
      product_id: product?.id
    };
  });
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


async addProductSale(sale: {
  product_id: string;
  quantity: number;
  date: string;
  notes?: string;
}) {
  const userId = await this.getUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Vérifier que l'utilisateur est un employé
  const user = await this.loadCurrentUser();
  if (!user) {
    throw new Error('User not found');
  }

  // Validation
  if (!sale.product_id) {
    throw new Error('Product ID is required');
  }

  if (sale.quantity < 1) {
    throw new Error('Quantity must be at least 1');
  }

  // Vérifier que le produit existe et appartient au manager de l'employé
  const managerId = await this.getManagerId();
  if (!managerId) {
    throw new Error('No manager found. Only employees with a manager can record sales.');
  }

  const { data: product, error: productError } = await this.supabase.client
    .from('product')
    .select('id, name, price, user_id')
    .eq('id', sale.product_id)
    .eq('user_id', managerId)  // Vérifier que le produit appartient au manager
    .single();

  if (productError || !product) {
    throw new Error('Product not found or does not belong to your manager');
  }

  // Insérer la vente
  const { data, error } = await this.supabase.client
    .from('income_product')
    .insert([{
      product_id: sale.product_id,
      quantity: sale.quantity,
      date: sale.date,
      notes: sale.notes || null,
      user_id: userId  // ID de l'employé
    }])
    .select()
    .single();

  if (error) {
    console.error('addProductSale error:', error);
    throw error;
  }

  return data;
}

/**
 * Récupère les informations complètes du manager
 * @returns Les données du manager ou null
 */
  async getManagerInfo(): Promise<{
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    tel_number?: number;
  } | null> {
    const managerId = await this.getManagerId();
    
    if (!managerId) {
      console.warn('getManagerInfo: No manager found for this user');
      return null;
    }

    const { data, error } = await this.supabase.client
      .from('users')
      .select('id, first_name, last_name, email, tel_number')
      .eq('id', managerId)
      .single();

    if (error) {
      console.error('getManagerInfo error:', error);
      return null;
    }

    return data;
  }

  async updateIncomeSource(model: any) {
    const { error } = await this.supabase.client
      .from('income_source')
      .update({
        name: model.name,
        amount: model.amount,
        notes: model.notes,
        id_category: model.category,
        date: model.date
      })
      .eq('id', model.id);

    if (error) throw error;
  }

  async deleteIncomeSource(id: string): Promise<void> {
    const userId = await this.getUserId();
    if (!userId) throw new Error("User not logged in");

    const { error } = await this.supabase.client
      .from('income_source')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting income source:', error);
      throw error;
    }
  }

  

  async updateIncomeProduct(model: any) {
    if (!model.id || model.id === 'undefined') {
      throw new Error('Invalid income product ID');
    }

    const userId = await this.getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Check if current user is admin
    const { data: currentUser, error: userError } = await this.supabase.client
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError || !currentUser) {
      throw new Error('Failed to verify user permissions');
    }

    // Use enum value instead of string
    if (currentUser.role !== UserRole.ADMIN && currentUser.role !== 'Admin') {
      throw new Error(`Only admins can update income products. Your role: ${currentUser.role}`);
    }

    // Prepare update data
    const updateData: any = {
      quantity: model.quantity,
      date: model.date,
      notes: model.notes ?? null,
      paymentMethod: model.paymentMethod
    };

    if (model.product && model.product !== 'undefined') {
      updateData.product_id = model.product;
    }

    // Update without user_id filter
    const { data, error } = await this.supabase.client
      .from('income_product')
      .update(updateData)
      .eq('id', model.id)
      .select();

    if (error) {
      console.error('Update error:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error('Income product not found');
    }

    return data[0];
  }

  async deleteIncomeProduct(id: string): Promise<void> {
    if (!id) throw new Error("Income product ID is required");
    console.log('Deleting income product with id:', id);

    const { error } = await this.supabase.client
      .from('income_product')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting income product:', error);
      throw error;
    }
  }

  async updateNormalExpense(model: any, file: File | null): Promise<string | null> {
    const userId = await this.getUserId();
    if (!userId) throw new Error("User not logged in");

    let receiptUrl: string | null = model.receipt || null;

    // If a new file is provided, delete the old one and upload the new one
    if (file) {
      // Delete old file if exists
      if (model.receipt) {
        try {
          const oldFilePath = model.receipt.split('/storage/v1/object/public/expense-images/')[1];
          if (oldFilePath) {
            const { error: deleteError } = await this.supabase.client
              .storage
              .from('expense-images')
              .remove([oldFilePath]);

            if (deleteError) {
              console.warn('Could not delete old receipt:', deleteError.message);
            }
          }
        } catch (err) {
          console.warn('Error deleting old receipt:', err);
        }
      }

      // Upload new file
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await this.supabase.client
        .storage
        .from('expense-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = this.supabase.client
        .storage
        .from('expense-images')
        .getPublicUrl(fileName);

      receiptUrl = urlData.publicUrl;
    }

    // Update the expense row
    const { data, error } = await this.supabase.client
      .from('normal_expenses')
      .update({
        amount: model.amount,
        date: model.date,
        notes: model.notes ?? null,
        receipt: receiptUrl,
        category_id: model.category,
        name: model.name,
      })
      .eq('id', model.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      throw error;
    }

    // Return the new receipt URL (or null if none)
    return receiptUrl;
  }
  
  async deleteNormalExpense(id: string, receiptUrl?: string): Promise<void> {
    const userId = await this.getUserId();
    if (!userId) throw new Error("User not authenticated");

    // Delete the file from storage if a receipt URL is provided
    if (receiptUrl) {
      // Extract the relative path inside the bucket from the URL
      // Example: if receiptUrl = https://PROJECT.supabase.co/storage/v1/object/public/expense-images/1234/file.png
      // then path = 1234/file.png
      const urlParts = receiptUrl.split('/expense-images/');
      const path = urlParts[1];
      if (path) {
        const { error: deleteError } = await this.supabase.client
          .storage
          .from('expense-images')
          .remove([path]);

        if (deleteError) {
          console.error('Error deleting receipt file:', deleteError);
          throw deleteError;
        }
      }
    }

    // Delete the row from the table
    const { error } = await this.supabase.client
      .from('normal_expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  async updateExpenseProduct(expense: any, file: File | null): Promise<string | null> {
    const userId = await this.getUserId();
    if (!userId) throw new Error("User not logged in");

    let receiptUrl: string | null = null;

    // Optional: upload receipt file to Supabase Storage
    if (file) {
      // Create unique filename to avoid conflicts
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await this.supabase.client
        .storage
        .from('expense-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = this.supabase.client
        .storage
        .from('expense-images')
        .getPublicUrl(fileName);

      receiptUrl = urlData.publicUrl;
    }

    // Insert the new product expense row
    const { data, error } = await this.supabase.client
      .from('product_expenses')
      .insert([{
        product_id: expense.product,
        quantity: expense.quantity,
        date: expense.date,
        notes: expense.notes ?? null,
        receipt: receiptUrl,
        user_id: userId
      }])
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      throw error;
    }

    // Return the public URL of the uploaded receipt (or null)
    return receiptUrl;
  }

  async deleteExpenseProduct(id: string, receiptUrl?: string): Promise<void> {
    const userId = await this.getUserId();
    if (!userId) throw new Error("User not authenticated");

    // Delete the file from storage if a receipt URL is provided
    if (receiptUrl) {
      // Extract the relative path inside the bucket from the URL
      // Example: if receiptUrl = https://PROJECT.supabase.co/storage/v1/object/public/expense-images/1234/file.png
      // then path = 1234/file.png
      const urlParts = receiptUrl.split('/expense-images/');
      const path = urlParts[1];
      if (path) {
        const { error: deleteError } = await this.supabase.client
          .storage
          .from('expense-images')
          .remove([path]);

        if (deleteError) {
          console.error('Error deleting receipt file:', deleteError);
          throw deleteError;
        }
      }
    }

    // Delete the row from the table
    const { error } = await this.supabase.client
      .from('product_expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting product expense:', error);
      throw error;
    }
  }

  async updateProduct(model: any) {
    const { error } = await this.supabase.client
      .from('product')
      .update({
        name: model.name,
        id_category: model.category,
        price: model.price,
        description: model.notes
      })
      .eq('id', model.id);

    if (error) throw error;
  }

  async addEmployee(employee: {
      email: string;
      password: string;
      first_name: string;
      last_name: string;
      gender: string;
      tel_number?: number;
      id_country?: string;
      id_currency?: string;
      avatar_url?: string;
    }): Promise<any> {
      const adminId = await this.getUserId();
      if (!adminId) {
        throw new Error('Admin not authenticated');
      }

      // Check if current user is admin
      const { data: currentUser, error: userError } = await this.supabase.client
        .from('users')
        .select('role')
        .eq('id', adminId)
        .single();

      if (userError || !currentUser || currentUser.role !== 'Admin') {
        throw new Error('Only admins can add employees');
      }

      try {
        // 1. Create auth user
        await this.auth.addEmployee({
          email: employee.email.trim(),
          password: employee.password,
          first_name: employee.first_name.trim(),
          last_name: employee.last_name.trim(),
          tel_number: employee.tel_number,
          type: UserType.BUSINESS,
          role: UserRole.EMPLOYEE,
          manager_id: adminId,
          gender: employee.gender
        });

      } catch (error: any) {
        console.error('Error adding employee:', error);
        throw error;
      }
    }

    async deleteEmployee(id: string): Promise<void> {
      const adminId = await this.getUserId();
      if (!adminId) {
        throw new Error("User not authenticated");
      }

      // 1. Check admin role
      const { data: adminData, error: adminErr } = await this.supabase.client
        .from("users")
        .select("role")
        .eq("id", adminId)
        .single();

      if (adminErr || !adminData || adminData.role !== "Admin") {
        throw new Error("Only admins can delete employees");
      }

      try {
        // 2. Fetch employee row (needed for avatar_url + validation)
        const { data: employee, error: empErr } = await this.supabase.client
          .from("users")
          .select("id, avatar_url")
          .eq("id", id)
          .single();

        if (empErr || !employee) {
          throw new Error("Employee does not exist");
        }

        // Prevent admin deleting themselves
        if (id === adminId) {
          throw new Error("Admin cannot delete themselves");
        }

        // 3. Delete avatar from storage (if not default)
        if (
          employee.avatar_url &&
          !employee.avatar_url.includes("default_avatar.jpg")
        ) {
          const parts = employee.avatar_url.split("/user_images/");
          const avatarPath = parts[1];

          if (avatarPath) {
            await this.supabase.client.storage
              .from("user_images")
              .remove([avatarPath]);
          }
        }

        // 4. Delete from public.users
        const { error: dbErr } = await this.supabase.client
          .from("users")
          .delete()
          .eq("id", id);

        if (dbErr) {
          console.error("Error deleting user row:", dbErr);
          throw new Error("Failed to delete user from database");
        }

        // 5. Delete from auth (must be last)
        const { error: authErr } =
          await this.supabase.client.auth.admin.deleteUser(id);

        if (authErr) {
          console.error("Error deleting auth user:", authErr);

          // Rollback: Restore row in public.users?
          // (Optional — usually not needed unless you want strict consistency)

          throw new Error("Failed to delete authentication user");
        }

        console.log("Employee deleted successfully:", id);
      } catch (error) {
        console.error("Error deleting employee:", error);
        throw error;
      }
    }

// Add this method to your dashboard.service.ts

/**
 * Updates user profile information
 * @param userData Partial user data to update
 * @returns Updated user data
 */
async updateUserProfile(userData: Partial<User>): Promise<User | null> {
  const userId = await this.getUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Prepare update object (only include fields that can be updated)
  const updateData: any = {};
  
  if (userData.first_name !== undefined) updateData.first_name = userData.first_name;
  if (userData.last_name !== undefined) updateData.last_name = userData.last_name;
  if (userData.email !== undefined) updateData.email = userData.email;
  if (userData.tel_number !== undefined) updateData.tel_number = userData.tel_number;
  if (userData.gender !== undefined) updateData.gender = userData.gender;
  if (userData.language !== undefined) updateData.language = userData.language;
  if (userData.theme !== undefined) updateData.theme = userData.theme;
  // Handle avatar_url explicitly to allow null values
  if (userData.avatar_url !== undefined) updateData.avatar_url = userData.avatar_url;

  // Update in database
  const { data, error } = await this.supabase.client
    .from('users')
    .update(updateData)
    .eq('id', userId)
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
    .single();

  if (error) {
    console.error('updateUserProfile error:', error);
    throw error;
  }

  if (!data) {
    return null;
  }

  // Transform response to User model
  const country = (data as any).country as any;
  const currency = (data as any).currency as any;

  const updatedUser: User = {
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
    theme: data.theme as ThemeMode,
    id_manager: data.id_manager,
    avatar_url: data.avatar_url,  // This can now be string, null, or undefined
    goal: data.goal ? Number(data.goal) : undefined
  };

  // Update cache
  this._cachedUser = updatedUser;

  return updatedUser;
}
// dashboard.service.ts - Update these three methods to use 'user_images' instead of 'avatars'

// dashboard.service.ts - Update these three methods to use 'user_images' instead of 'avatars'
// dashboard.service.ts - Avatar upload with image resizing

/**
 * Resize image to specific dimensions
 * @param file Original image file
 * @param maxWidth Maximum width (default 300px)
 * @param maxHeight Maximum height (default 300px)
 * @returns Resized image as Blob
 */
private async resizeImage(file: File, maxWidth: number = 300, maxHeight: number = 300): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        // Create canvas and resize
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          'image/jpeg',
          0.85 // Quality (0.85 = 85%)
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Upload avatar to Supabase Storage with automatic resizing
 * @param file Image file to upload
 * @returns Public URL of uploaded avatar
 */
async uploadAvatar(file: File): Promise<string | null> {
  const userId = await this.getUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error(`Invalid file type: ${file.type}. Please select an image file.`);
    }

    // Validate file size (before resize - 10MB limit for original)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size is 10MB.`);
    }

    console.log('Original file size:', (file.size / 1024).toFixed(2), 'KB');

    // Resize image to 300x300 (or smaller while maintaining aspect ratio)
    const resizedBlob = await this.resizeImage(file, 300, 300);
    console.log('Resized file size:', (resizedBlob.size / 1024).toFixed(2), 'KB');

    // Generate unique filename
    const fileExt = 'jpg'; // Always save as JPG after resize
    const fileName = `avatars/${userId}/avatar-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    console.log('Uploading to:', filePath);

    // Delete old avatar if exists
    const currentUser = this._cachedUser || await this.loadCurrentUser();
    if (currentUser?.avatar_url) {
      const oldPath = this.extractPathFromUrl(currentUser.avatar_url);
      if (oldPath) {
        const { error: deleteError } = await this.supabase.client.storage
          .from('user_images')
          .remove([oldPath]);
        
        if (deleteError) {
          console.warn('Failed to delete old avatar:', deleteError);
        }
      }
    }

    // Upload resized avatar
    const { data, error } = await this.supabase.client.storage
      .from('user_images')
      .upload(filePath, resizedBlob, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/jpeg'
      });

    if (error) {
      console.error('Upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }

    console.log('Upload successful:', data);

    // Get public URL
    const { data: urlData } = this.supabase.client.storage
      .from('user_images')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;
    console.log('Public URL:', publicUrl);

    // Update user profile with new avatar URL
    await this.updateUserProfile({ avatar_url: publicUrl });

    return publicUrl;
  } catch (error: any) {
    console.error('uploadAvatar error:', error);
    throw error;
  }
}

/**
 * Extract storage path from Supabase URL
 * @param url Full Supabase storage URL
 * @returns Storage path or null
 */
private extractPathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const bucketIndex = pathParts.indexOf('user_images');
    if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
      return pathParts.slice(bucketIndex + 1).join('/');
    }
    return null;
  } catch (e) {
    console.error('Error extracting path from URL:', e);
    return null;
  }
}

/**
 * Delete user avatar
 * @returns true if successful
 */
async deleteAvatar(): Promise<boolean> {
  const userId = await this.getUserId();
  if (!userId) {
    throw new Error('User not authenticated');
  }

  try {
    const currentUser = this._cachedUser || await this.loadCurrentUser();
    if (!currentUser?.avatar_url) {
      return true; // No avatar to delete
    }

    // Extract path from URL
    const path = this.extractPathFromUrl(currentUser.avatar_url);
    if (!path) {
      return false;
    }

    // Delete from storage
    const { error } = await this.supabase.client.storage
      .from('user_images')
      .remove([path]);

    if (error) {
      console.error('Delete avatar error:', error);
      throw error;
    }

    // Update user record to set avatar_url to null
    await this.updateUserProfile({ avatar_url: null });

    return true;
  } catch (error) {
    console.error('deleteAvatar error:', error);
    throw error;
  }
}

public clearCache(): void {
  this._cachedUser = undefined;
  console.log('User cache cleared');
}

}