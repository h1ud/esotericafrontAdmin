import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./layouts/admin-panel-layout/admin-panel-layout').then((m) => m.AdminPanelLayout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'clients',
        loadComponent: () => import('./pages/clients/clients').then((m) => m.Clients),
      },
      {
        path: 'employees',
        loadComponent: () => import('./pages/employees/employees').then((m) => m.Employees),
      },
      {
        path: 'menu',
        loadComponent: () => import('./pages/menu/menu').then((m) => m.Menu),
      },
      {
        path: 'codes',
        loadComponent: () => import('./pages/codes/codes').then((m) => m.Codes),
      },
      {
        path: 'reports',
        loadComponent: () => import('./pages/reports/reports').then((m) => m.Reports),
      },

      {
        path: 'password-reset-list',
        loadComponent: () => import('./pages/password-reset-list/password-reset-list').then((m) => m.PasswordResetList),
      },
    ],
  },
  {
    path: 'passwordReset',
    loadComponent: () =>
      import('./pages/password-reset/password-reset').then((m) => m.PasswordReset),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
