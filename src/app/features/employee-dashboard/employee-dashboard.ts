import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { EmployeeProductFormComponent } from '../employee-product-form/employee-product-form';
import { RecentTransactionComponent } from '../../shared/components/recent-transaction-component/recent-transaction-component';
import { DashboardService } from '../../services/dashboard.service';
import { Transaction, Type } from '../../shared/model/transaction';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, EmployeeProductFormComponent, RecentTransactionComponent],
  templateUrl: './employee-dashboard.html',
  styleUrls: ['./employee-dashboard.css']
})
export class EmployeeDashboard implements OnInit {

   transactions: Transaction[] = [];
  loading = true;
  name: string = 'User';

  // Statistics
  todaySales: number = 0;
  weekSales: number = 0;
  monthSales: number = 0;
  totalTransactions: number = 0;

  constructor(private dash: DashboardService) {}

  async getCurrentUserProfile() {
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
    const profile = await this.getCurrentUserProfile();
    this.name = profile?.first_name + ' ' + profile?.last_name;

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
}