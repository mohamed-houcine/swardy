import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InterfOptions } from "../../shared/components/interf-options/interf-options";
import { DashboardService } from '../../services/dashboard.service';
import { CommonModule, NgIf } from '@angular/common';
import { UserRole } from '../../shared/model/user';
import { EmployeeDashboard } from '../../features/employee-dashboard/employee-dashboard';

@Component({
  selector: 'app-default-layout',
  imports: [RouterOutlet, InterfOptions, NgIf],
  templateUrl: './default-layout.html',
  styleUrls: ['./default-layout.css']
})
export class DefaultLayout implements OnInit {

  showBusinessOptions!: boolean;      
  showEmployeeDashboard = false;
  loaded = false;      

  constructor(private dash: DashboardService) {}

  async ngOnInit() {
    const user = await this.dash.loadCurrentUser();

    if (user) {
      this.showBusinessOptions = user.type === 'Business';
      this.showEmployeeDashboard = user.role === UserRole.EMPLOYEE;
    }

    this.loaded = true;
  }

}
