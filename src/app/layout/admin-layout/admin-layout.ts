import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Auth } from '../../core/auth/auth';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  selector: 'app-admin-layout',
  styleUrl: './admin-layout.scss',
  templateUrl: './admin-layout.html',
})
export class AdminLayout {
  protected readonly auth = inject(Auth);

  // Se irán sumando secciones a medida que avancen las fases del roadmap.
  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Servicios', icon: 'subscriptions', route: '/services' },
    { label: 'Contactos', icon: 'contacts', route: '/contacts' },
    { label: 'Cuentas', icon: 'account_circle', route: '/accounts' },
    { label: 'Ventas', icon: 'point_of_sale', route: '/sales' },
    { label: 'Vencimientos', icon: 'event_busy', route: '/vencimientos' },
    { label: 'Gastos', icon: 'payments', route: '/expenses' },
    { label: 'Contabilidad', icon: 'account_balance', route: '/accounting' },
  ];

  logout(): void {
    this.auth.logout();
  }
}
