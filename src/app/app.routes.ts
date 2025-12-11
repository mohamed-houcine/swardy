import { Routes } from '@angular/router';
import { DefaultLayout } from './layouts/default-layout/default-layout';
import { SimpleLayout } from './layouts/simple-layout/simple-layout';
import { AuthGuard } from './core/auth/auth.guard';
import { NoAuthGuard } from './core/auth/no-auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: DefaultLayout, // Layout with header
    canActivate: [AuthGuard],   // <----- PROTECT EVERYTHING
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'income',
        loadComponent: () => import('./features/income/income').then(m => m.Income)
      },
      {
        path: 'expenses',
        loadComponent: () =>
          import('./features/expenses/expenses').then(m => m.Expenses)
      },
      {
        path: 'employees',
        loadComponent: () =>
          import('./features/employees/employees').then(m => m.Employees)
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/products').then(m => m.Products)
      },
      {
        path: 'employee',
        loadComponent: () =>
          import('./features/employee-dashboard/employee-dashboard').then(m => m.EmployeeDashboard)
      }, 
    ]
  },
  {
    path: '',
    component: SimpleLayout, // Layout without header
    children: [
      {
        path: 'login',
        canActivate: [NoAuthGuard],
        loadComponent: () => import('./features/login/login').then(m => m.Login)
      },
      {
        path: 'signup',
        canActivate: [NoAuthGuard],
        loadComponent: () => import('./features/signup/signup').then(m => m.Signup)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];