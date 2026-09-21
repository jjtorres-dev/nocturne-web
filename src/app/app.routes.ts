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
        path: 'combos',
        loadComponent: () =>
          import('./features/combos/combos-list/combos-list').then(
            (m) => m.CombosList,
          ),
      },
      {
        path: 'combo-sales',
        loadComponent: () =>
          import(
            './features/combo-sales/venta-combos-list/venta-combos-list'
          ).then((m) => m.VentaCombosList),
      },
      {
        path: 'combo-sales/nueva',
        loadComponent: () =>
          import(
            './features/combo-sales/venta-combo-create/venta-combo-create'
          ).then((m) => m.VentaComboCreate),
      },
      {
        path: 'combo-sales/:id',
        loadComponent: () =>
          import(
            './features/combo-sales/venta-combo-detail/venta-combo-detail'
          ).then((m) => m.VentaComboDetail),
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
      {
        // Sin `role`: cualquier usuario logueado (el authGuard del padre basta).
        // No está en `navItems`: se llega solo desde el menú del pie del sidebar.
        path: 'configuracion',
        loadComponent: () =>
          import('./features/configuracion/configuracion').then(
            (m) => m.Configuracion,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/usuarios-list/usuarios-list').then(
            (m) => m.UsuariosList,
          ),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
