import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Auth, UserRole } from '../../core/auth/auth';
import { AvatarInicial } from '../../shared/avatar-inicial/avatar-inicial';
import { injectIsMobile } from '../../shared/breakpoints';
import { GlobalSearch } from '../../shared/global-search/global-search';
import { USER_ROLE_LABELS } from '../../features/users/usuario.model';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  // Título del grupo del menú al que pertenece ('' = sin título, va arriba).
  group: string;
  // Si viene, el item solo se muestra a usuarios con ese rol — hoy solo lo
  // usa "Usuarios" (admin-only, mismo criterio que el backend).
  role?: UserRole;
}

@Component({
  imports: [
    AvatarInicial,
    GlobalSearch,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
  ],
  selector: 'app-admin-layout',
  styleUrl: './admin-layout.scss',
  templateUrl: './admin-layout.html',
})
export class AdminLayout {
  protected readonly auth = inject(Auth);

  // En pantallas angostas el sidenav pasa a modo "over" (oculto por defecto,
  // se abre con "Menú" en la barra inferior); en desktop queda fijo y visible.
  protected readonly isMobile = injectIsMobile();

  protected readonly roleLabels = USER_ROLE_LABELS;

  // Mientras el buscador global está expandido en móvil, oculta la marca del
  // header para que ocupe todo el ancho (ver GlobalSearch, que lo maneja con
  // [(mobileExpanded)]). Sin `protected`: el test de responsive lo fuerza
  // directo, sin simular el click real.
  readonly searchExpanded = signal(false);

  // "lunes, 5 de octubre": la fecha de la cartelera de hoy.
  protected readonly hoy = new Intl.DateTimeFormat('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  // El orden del array es el orden del menú; los items de un mismo `group`
  // van seguidos.
  private readonly allNavItems: NavItem[] = [
    { label: 'Inicio', icon: 'dashboard', route: '/dashboard', group: '' },
    { label: 'Ventas', icon: 'point_of_sale', route: '/sales', group: 'Vender' },
    { label: 'Ventas de combos', icon: 'shopping_cart', route: '/combo-sales', group: 'Vender' },
    { label: 'Vencimientos', icon: 'event_busy', route: '/vencimientos', group: 'Vender' },
    { label: 'Clientes y proveedores', icon: 'contacts', route: '/contacts', group: 'Vender' },
    { label: 'Servicios', icon: 'subscriptions', route: '/services', group: 'Inventario' },
    { label: 'Cuentas', icon: 'account_circle', route: '/accounts', group: 'Inventario' },
    { label: 'Combos', icon: 'inventory_2', route: '/combos', group: 'Inventario' },
    { label: 'Gastos', icon: 'payments', route: '/expenses', group: 'Dinero' },
    { label: 'Contabilidad', icon: 'account_balance', route: '/accounting', group: 'Dinero' },
    {
      label: 'Usuarios',
      icon: 'group',
      route: '/users',
      group: 'Administración',
      role: UserRole.ADMIN,
    },
  ];

  // Barra inferior (solo celular): lo que se abre varias veces al día. El
  // resto del menú sigue en el panel lateral, detrás de "Menú".
  protected readonly bottomItems = ['/dashboard', '/sales', '/vencimientos', '/accounts'].map(
    (route) => this.allNavItems.find((item) => item.route === route)!,
  );

  // Un item con `role` solo se muestra a usuarios con exactamente ese rol
  // — hoy nunca se ve "Usuarios" en el sidebar de un REVENDEDOR, sin
  // depender de que además el backend rechace la request.
  readonly navItems = computed(() =>
    this.allNavItems.filter(
      (item) => !item.role || item.role === this.auth.currentUser()?.role,
    ),
  );

  // Los mismos items, agrupados para pintar el menú con sus títulos.
  protected readonly navGroups = computed(() => {
    const groups: { label: string; items: NavItem[] }[] = [];
    for (const item of this.navItems()) {
      const last = groups.at(-1);
      if (last?.label === item.group) {
        last.items.push(item);
      } else {
        groups.push({ label: item.group, items: [item] });
      }
    }
    return groups;
  });

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
