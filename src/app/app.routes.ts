import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/admin-layout/admin-layout').then((m) => m.AdminLayout),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./features/services/servicios-list/servicios-list').then(
            (m) => m.ServiciosList,
          ),
      },
      {
        path: 'contacts',
        loadComponent: () =>
          import('./features/contacts/contactos-list/contactos-list').then(
            (m) => m.ContactosList,
          ),
      },
      {
        path: 'accounts',
        loadComponent: () =>
          import('./features/accounts/cuentas-list/cuentas-list').then(
            (m) => m.CuentasList,
          ),
      },
      {
        path: 'accounts/:id',
        loadComponent: () =>
          import('./features/accounts/cuenta-detail/cuenta-detail').then(
            (m) => m.CuentaDetail,
          ),
      },
      {
        path: 'sales',
        loadComponent: () =>
          import('./features/sales/ventas-list/ventas-list').then(
            (m) => m.VentasList,
          ),
      },
      {
        path: 'vencimientos',
        loadComponent: () =>
          import(
            './features/vencimientos/vencimientos-list/vencimientos-list'
          ).then((m) => m.VencimientosList),
      },
      {
        path: 'expenses',
        loadComponent: () =>
          import('./features/expenses/gastos-list/gastos-list').then(
            (m) => m.GastosList,
          ),
      },
      {
        path: 'accounting',
        loadComponent: () =>
          import('./features/accounting/accounting').then(
            (m) => m.Accounting,
          ),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
