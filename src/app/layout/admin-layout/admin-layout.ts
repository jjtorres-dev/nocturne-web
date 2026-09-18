import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Auth, UserRole } from '../../core/auth/auth';
import { MOBILE_BREAKPOINT_QUERY } from '../../shared/breakpoints';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  // Si viene, el item solo se muestra a usuarios con ese rol — hoy solo lo
  // usa "Usuarios" (admin-only, mismo criterio que el backend).
  role?: UserRole;
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
  private readonly breakpoints = inject(BreakpointObserver);

  // En pantallas angostas el sidenav pasa a modo "over" (oculto por defecto,
  // se abre con el botón de hamburguesa); en desktop queda fijo y visible.
  protected readonly isMobile = toSignal(
    this.breakpoints.observe(MOBILE_BREAKPOINT_QUERY).pipe(map((state) => state.matches)),
    { initialValue: this.breakpoints.isMatched(MOBILE_BREAKPOINT_QUERY) },
  );

  // Se irán sumando secciones a medida que avancen las fases del roadmap.
  private readonly allNavItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Servicios', icon: 'subscriptions', route: '/services' },
    { label: 'Contactos', icon: 'contacts', route: '/contacts' },
    { label: 'Cuentas', icon: 'account_circle', route: '/accounts' },
    { label: 'Ventas', icon: 'point_of_sale', route: '/sales' },
    { label: 'Combos', icon: 'inventory_2', route: '/combos' },
    { label: 'Ventas Combo', icon: 'shopping_cart', route: '/combo-sales' },
    { label: 'Vencimientos', icon: 'event_busy', route: '/vencimientos' },
    { label: 'Gastos', icon: 'payments', route: '/expenses' },
    { label: 'Contabilidad', icon: 'account_balance', route: '/accounting' },
    { label: 'Usuarios', icon: 'group', route: '/users', role: UserRole.ADMIN },
  ];

  // Un item con `role` solo se muestra a usuarios con exactamente ese rol
  // — hoy nunca se ve "Usuarios" en el sidebar de un REVENDEDOR, sin
  // depender de que además el backend rechace la request.
  readonly navItems = computed(() =>
    this.allNavItems.filter(
      (item) => !item.role || item.role === this.auth.currentUser()?.role,
    ),
  );

  // Al elegir una opción del menú en modo "over" se cierra solo; en desktop
  // (modo "side") no hay nada que cerrar.
  protected closeIfMobile(sidenav: MatSidenav): void {
    if (this.isMobile()) {
      void sidenav.close();
    }
  }

  async logout(): Promise<void> {
    await this.auth.logout();
  }
}
