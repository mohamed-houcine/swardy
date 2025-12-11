
import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { InterfOptions } from "../../shared/components/interf-options/interf-options";
import { DashboardService } from '../../services/dashboard.service';
import { CommonModule, NgIf } from '@angular/common';
import { UserRole, UserType } from '../../shared/model/user';

@Component({
  selector: 'app-default-layout',
  imports: [RouterOutlet, InterfOptions, NgIf, CommonModule],
  templateUrl: './default-layout.html',
  styleUrls: ['./default-layout.css']
})
export class DefaultLayout implements OnInit {
  showBusinessOptions = false;  
  business !:boolean;      
    
  showEmployeeDashboard = false;
  loaded = false;      

  constructor(
    private dash: DashboardService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Force refresh to get current user
    const user = await this.dash.loadCurrentUser(true);
    
    console.log("Current user:", user);
    
    if (!user) {
      // No user, redirect to login
      this.router.navigate(['/login']);
      return;
    }

    // Set visibility flags
    this.business=user.type==UserType.BUSINESS;
    this.showBusinessOptions = user.role === UserRole.ADMIN;
    this.showEmployeeDashboard = user.role === UserRole.EMPLOYEE;
    
    console.log("Show business options:", this.showBusinessOptions);
    console.log("Show employee dashboard:", this.showEmployeeDashboard);

    // Redirect employee if trying to access admin pages
    if (user.role === UserRole.EMPLOYEE && this.router.url === '/') {
      this.router.navigate(['/employee']);
    }

    this.loaded = true;
  }
}
