import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { DefaultLayout } from './layouts/default-layout/default-layout';
import { Dashboard } from './features/dashboard/dashboard';
import { EmployeeDashboard } from './features/employee-dashboard/employee-dashboard';
import { ProfilePage } from './features/profile-page/profile-page';
import { adminGuard, employeeGuard, authGuard } from './core/auth/role.guard';

export const routes: Routes = [
  // ========== PUBLIC ROUTES (No Authentication Required) ==========
  {
    path: 'login',
    component: Login
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/signup/signup').then(m => m.Signup)
  },
  
  // ========== PROTECTED ROUTES (Authentication Required) ==========
  {
    path: '',
    component: DefaultLayout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: Dashboard,
        canActivate: [adminGuard]
      },
      {
        path: 'income',
        loadComponent: () => import('./features/income/income').then(m => m.Income),
        canActivate: [adminGuard]
      },
      {
        path: 'expenses',
        loadComponent: () => import('./features/expenses/expenses').then(m => m.Expenses),
        canActivate: [adminGuard]
      },
      {
        path: 'employees',
        loadComponent: () => import('./features/employees/employees').then(m => m.Employees),
        canActivate: [adminGuard]
      },
      {
        path: 'products',
        loadComponent: () => import('./features/products/products').then(m => m.Products),
        canActivate: [adminGuard]
      },
      {
        path: 'employee',
        component: EmployeeDashboard,
        canActivate: [employeeGuard]
      },
      {
        path: 'profile',
        component: ProfilePage,
        canActivate: [authGuard]
      }
    ]
  },
  
  // ========== WILDCARD ROUTE ==========
  {
    path: '**',
    redirectTo: 'login' // Redirect to login instead of empty path
  }
];