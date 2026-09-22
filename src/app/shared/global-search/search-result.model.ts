// Mismo shape que el backend (nocturne-api: src/common/search-result.ts,
// src/search/search-response.ts). `label` trae el campo que matcheó, con
// contexto breve si aplica (ej. Cuentas: "correo — Servicio"); es texto
// libre del usuario (puede traer cualquier caracter, incluido '\n'), así que
// nunca se parsea. `ownerName` es un campo aparte, presente solo cuando
// quien busca es admin (ver resolveOwnerName en el backend).
export interface SearchResultItem {
  id: string;
  label: string;
  ownerName?: string;
}

export interface SearchResponse {
  contactos: SearchResultItem[];
  cuentas: SearchResultItem[];
  servicios: SearchResultItem[];
  combos: SearchResultItem[];
  ventas: SearchResultItem[];
  ventasCombo: SearchResultItem[];
  gastos: SearchResultItem[];
}

export interface SearchCategory {
  key: keyof SearchResponse;
  label: string;
  // Mismo ícono que esa sección en el sidebar (admin-layout.ts).
  icon: string;
  // Cuentas y Ventas Combo abren el detalle puntual; el resto no tiene
  // página de detalle propia, así que van a su lista.
  route(id: string): string[];
}

export const SEARCH_CATEGORIES: SearchCategory[] = [
  {
    key: 'contactos',
    label: 'Contactos',
    icon: 'contacts',
    route: () => ['/contacts'],
  },
  {
    key: 'cuentas',
    label: 'Cuentas',
    icon: 'account_circle',
    route: (id) => ['/accounts', id],
  },
  {
    key: 'servicios',
    label: 'Servicios',
    icon: 'subscriptions',
    route: () => ['/services'],
  },
  {
    key: 'combos',
    label: 'Combos',
    icon: 'inventory_2',
    route: () => ['/combos'],
  },
  {
    key: 'ventas',
    label: 'Ventas',
    icon: 'point_of_sale',
    route: () => ['/sales'],
  },
  {
    key: 'ventasCombo',
    label: 'Ventas Combo',
    icon: 'shopping_cart',
    route: (id) => ['/combo-sales', id],
  },
  {
    key: 'gastos',
    label: 'Gastos',
    icon: 'payments',
    route: () => ['/expenses'],
  },
];
