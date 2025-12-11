import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';

export const adminGuard: CanActivateFn = async (route, state) => {
  const dash = inject(DashboardService);
  const router = inject(Router);

  const user = await dash.loadCurrentUser(true); // Force refresh
  
  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  if (user.role !== 'Admin') {
    router.navigate(['/employee']);
    return false;
  }

  return true;
};

export const employeeGuard: CanActivateFn = async (route, state) => {
  const dash = inject(DashboardService);
  const router = inject(Router);

  const user = await dash.loadCurrentUser(true); // Force refresh
  
  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  if (user.role !== 'Employee') {
    router.navigate(['/']);
    return false;
  }

  return true;
};

export const authGuard: CanActivateFn = async (route, state) => {
  const dash = inject(DashboardService);
  const router = inject(Router);

  const user = await dash.loadCurrentUser(true);
  
  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};