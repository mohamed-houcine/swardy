import { Component, OnInit } from '@angular/core';
import { TotalComponent } from "../../shared/components/total-component/total-component";
import { NetBalanceComponent } from "../../shared/components/net-balance/net-balance";
import { GoalComponent } from "../../shared/components/goal-component/goal-component";
import { PieChartComponent } from "../../shared/components/pie-chart/pie-chart";
import { RecentTransactionComponent } from "../../shared/components/recent-transaction-component/recent-transaction-component";
import { DashboardService } from '../../services/dashboard.service';
import { Transaction, Type } from '../../shared/model/transaction';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    TotalComponent,
    NetBalanceComponent,
    GoalComponent,
    PieChartComponent,
    RecentTransactionComponent,

  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {


   constructor(
    private dash: DashboardService,
    private router: Router
  ) {}

  name: string = 'User';

  // TOTALS
  totalIncome = 0;
  totalExpense = 0;
  totalBalance = 0;

  // PIE CHARTS
  incomeLabels: string[] = [];
  incomeData: number[] = [];
  incomeColors: string[] = [];

  expenseLabels: string[] = [];
  expenseData: number[] = [];
  expenseColors: string[] = [];

  // RECENT TRANSACTIONS
  transactions: Transaction[] = [];

  // GOAL (example: user sets 40K goal)
  goalAmount!: number | null;

  // Navigation method to profile
  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  async getCurrentUserProfile() {
    // Use the cached user from DashboardService
    const user = await this.dash.loadCurrentUser();
    
    if (user) {
      return {
        first_name: user.first_name,
        last_name: user.last_name
      };
    }

    // Fallback to direct query if needed
    const { data: auth } = await this.dash.supabase.client.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return null;

    const { data, error } = await this.dash.supabase.client
      .from("users")
      .select("first_name, last_name")
      .eq("id", uid)
      .single();

    if (error) {
      console.error("getCurrentUserProfile error", error);
      return null;
    }

    return data;
  }

  async ngOnInit() {

    // 1️⃣ Load user name
    const profile = await this.getCurrentUserProfile();

    this.name = profile ? `${profile.first_name} ${profile.last_name}` : 'User';

    // 2️⃣ Load everything from Supabase in parallel
    const [incomes, expenses, categories, goal] = await Promise.all([
      this.dash.fetchIncomes(),
      this.dash.fetchExpenses(),
      this.dash.fetchCategories(),
      this.dash.fetchGoal()
    ]);

    // Get this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const monthlyIncomes = incomes.filter(income => {
      const incomeDate = new Date(income.date);
      return incomeDate >= startOfMonth && incomeDate <= endOfMonth;
    });

    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startOfMonth && expenseDate <= endOfMonth;
    });

    // 3️⃣ Totals
    this.totalIncome = monthlyIncomes.reduce((a, b) => a + b.amount, 0);
    this.totalExpense = monthlyExpenses.reduce((a, b) => a + b.amount, 0);
    this.totalBalance = this.totalIncome - this.totalExpense;
    this.goalAmount = goal;

    // 4️⃣ Income Distribution (PRODUCT -> CATEGORY)
    const incomeDist = await this.dash.categoryDistribution(
      incomes,
      categories
    );
    
    this.incomeLabels = incomeDist.map(x => x.label);
    this.incomeData   = incomeDist.map(x => x.value);
    this.incomeColors = incomeDist.map(x => x.color || "#ccc");

    // 5️⃣ Expense Distribution
    const expenseDist = await this.dash.categoryDistribution(
      expenses,
      categories
    );
    this.expenseLabels = expenseDist.map(x => x.label);
    this.expenseData   = expenseDist.map(x => x.value);
    this.expenseColors = expenseDist.map(x => x.color || "#ccc");

    // 6️⃣ Recent Transactions (latest 5)
    this.transactions = [
      ...incomes.map(i => ({
        amount: i.amount,
        date: new Date(i.date).toLocaleDateString(),
        name: 'product' in i ? i.product : i.name,
        type: Type.INCOME,
        incomeType: "product" in i ? "product" : "source"
      })),
      ...expenses.map(e => {
        const catId =
          (e as any).categoryId ??
          (e as any).category_id ??
          null;

        return {
          amount: e.amount,
          date: new Date(e.date).toLocaleDateString(),
          name: categories.find(c => c.id === catId)?.name ?? "Expense",
          type: Type.EXPENSE
        };
      })
    ]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 5);
  }
}
