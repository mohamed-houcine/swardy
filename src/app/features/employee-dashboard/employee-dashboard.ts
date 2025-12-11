import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';              // <-- add
import { EmployeeProductFormComponent } from '../employee-product-form/employee-product-form';
import { RecentTransactionComponent } from '../../shared/components/recent-transaction-component/recent-transaction-component';
import { DashboardService } from '../../services/dashboard.service';
import { Transaction, Type } from '../../shared/model/transaction';
import { AuthService } from '../../core/auth/auth.service';
@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, EmployeeProductFormComponent, RecentTransactionComponent,RouterLink],
  templateUrl: './employee-dashboard.html',
  styleUrls: ['./employee-dashboard.css']
})
export class EmployeeDashboard implements OnInit {

  transactions: Transaction[] = [];
  loading = true;
  name: string = 'User';

  // avatar / profile
  avatarUrl: string | null = null;
  userName = 'User';

  // Statistics
  todaySales: number = 0;
  weekSales: number = 0;
  monthSales: number = 0;
  totalTransactions: number = 0;

  constructor(private dash: DashboardService, private router: Router, private auth: AuthService,) {}  // <-- inject Router

  async getCurrentUserProfile() {
    const { data: auth } = await this.dash.supabase.client.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return null;

    const { data, error } = await this.dash.supabase.client
      .from("users")
      .select("first_name, last_name, avatar_url")   // <-- include avatar field if available
      .eq("id", uid)
      .single();

    if (error) {
      console.error("getCurrentUserProfile error", error);
      return null;
    }

    return data;
  }

  async ngOnInit() {
    const profile = await this.getCurrentUserProfile();
    this.name = profile?.first_name + ' ' + profile?.last_name;
    // set avatar & display name so template can reuse
    this.avatarUrl = profile?.avatar_url || null;
    this.userName = this.name || 'User';

    await this.loadData();
  }

  async loadData() {
    this.loading = true;
    try {
      // Fetch transactions
      const rawTransactions = await this.dash.fetchLastEmployeeTransactions(20);
      
      // Transform to Transaction model
      this.transactions = rawTransactions.map(t => ({
        id: t.id,
        name: t.name,
        amount: t.amount,
        date: this.formatDate(t.date),
        type: Type.INCOME,
        notes: t.notes || ''
      } as Transaction));

      // Calculate statistics

    } catch (err) {
      console.error('Failed to fetch transactions', err);
    } finally {
      this.loading = false;
    }
  }

  // Profile avatar helpers (same behavior as InterfOptions)
  getAvatarUrl(): string {
    return this.avatarUrl || '/assets/images/default-avatar.png';
  }

  hasAvatar(): boolean {
    return !!this.avatarUrl;
  }

  getInitials(): string {
    const names = (this.userName || 'User').split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return (this.userName || 'Us').substring(0, 2).toUpperCase();
  }

  // Optionally used to set some UI state before navigation (not required)
  onProfileClick() {
    // if you keep a shared "active key" in DashboardService you could set it here,
    // e.g. this.dash.setActiveKey?.(-1);
    // For now we simply ensure navigation (routerLink will already navigate).
  }

  // Allow template to detect current route and mark profile link active
  isProfileActive(): boolean {
    return this.router.url.includes('/profile');
  }

  async getCurrentUserId(): Promise<string | null> {
    const { data: auth } = await this.dash.supabase.client.auth.getUser();
    return auth.user?.id ?? null;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time for comparison
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return 'Today';
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  }
logout() {
    // Clear dashboard service cache
    this.dash['_cachedUser'] = undefined;
    
    // Logout via auth service (which clears everything)
    this.auth.logout();
  }
}
