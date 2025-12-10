import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { EmployeeProductFormComponent } from '../employee-product-form/employee-product-form';
import { RecentTransactionComponent } from '../../shared/components/recent-transaction-component/recent-transaction-component';
import { DashboardService } from '../../services/dashboard.service';


@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, EmployeeProductFormComponent, RecentTransactionComponent],
  templateUrl: './employee-dashboard.html',
  styleUrls: ['./employee-dashboard.css']
})
export class EmployeeDashboard implements OnInit {


  transactions: any[] = [];
  loading = true;

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

  name: string = 'User';

  async ngOnInit() {
    const profile = await this.getCurrentUserProfile();

    this.name = profile?.first_name + ' ' + profile?.last_name;

    
    this.loading = true;
    try {
      this.transactions = await this.dash.fetchLastEmployeeTransactions(10);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    } finally {
      this.loading = false;
    }
  }

}
