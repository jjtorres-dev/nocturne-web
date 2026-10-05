import type { Owner } from '../../shared/owner.model';

export enum Moneda {
  PEN = 'PEN',
  USD = 'USD',
  ARS = 'ARS',
  BS = 'BS',
  CLP = 'CLP',
  COP = 'COP',
  CRC = 'CRC',
  CUP = 'CUP',
  DOP = 'DOP',
  MXN = 'MXN',
  PYG = 'PYG',
  UYU = 'UYU',
}

// Un revendedor no siempre conoce los códigos ISO: el select muestra el
// código + el nombre en español. El valor que viaja a la API sigue siendo
// el código.
export const MONEDA_LABELS: Record<Moneda, string> = {
  [Moneda.PEN]: 'PEN – Soles',
  [Moneda.USD]: 'USD – Dólares',
  [Moneda.ARS]: 'ARS – Pesos argentinos',
  [Moneda.BS]: 'BS – Bolívares',
  [Moneda.CLP]: 'CLP – Pesos chilenos',
  [Moneda.COP]: 'COP – Pesos colombianos',
  [Moneda.CRC]: 'CRC – Colones',
  [Moneda.CUP]: 'CUP – Pesos cubanos',
  [Moneda.DOP]: 'DOP – Pesos dominicanos',
  [Moneda.MXN]: 'MXN – Pesos mexicanos',
  [Moneda.PYG]: 'PYG – Guaraníes',
  [Moneda.UYU]: 'UYU – Pesos uruguayos',
};

export interface Venta {
  id: string;
  clienteId: string;
  cuentaId: string;
  perfilId: string | null;
  servicioId: string;
  codigoVenta: string;
  duracionMeses: number;
  fechaInicio: string;
  fechaFin: string;
  precio: number;
  moneda: Moneda;
  tasaCambio: number;
  precioPEN: number;
  metodoPago: string;
  renovacionAutomatica: boolean;
  activo: boolean;
  // No nulo solo cuando esta venta es "hija" de un combo (ver
  // /api/combo-sales): en ese caso se gestiona desde Ventas de Combo, no
  // desde esta pantalla (ver VentasList.esDeCombo).
  ventaComboId: string | null;
  // true si la cuenta de la venta está caída (el cliente está sin
  // servicio hasta que el proveedor la reponga). Lo traen los listados y
  // el detalle; no la respuesta de crear una venta.
  cuentaCaida?: boolean;
  owner: Owner;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVentaPayload {
  clienteId: string;
  cuentaId: string;
  perfilId?: string;
  fechaInicio: string;
  fechaFin: string;
  precio: number;
  moneda: Moneda;
  tasaCambio?: number;
  metodoPago: string;
  renovacionAutomatica?: boolean;
}

// El backend acepta PATCH parcial, pero el modal de editar solo expone
// estos campos a propósito: cambiar servicio/cuenta/perfil/cliente tiene
// que pasar por las validaciones de exclusividad (desactivar + crear una
// venta nueva), no por un PATCH genérico.
export interface UpdateVentaPayload {
  fechaFin?: string;
  precio?: number;
  moneda?: Moneda;
  tasaCambio?: number;
  metodoPago?: string;
  renovacionAutomatica?: boolean;
}

// Body opcional de POST /sales/:id/renew: nunca fechaFin — la calcula el
// backend a partir de duracionMeses (ver VentaRenewDialog, que por eso no
// hace ninguna cuenta de fechas en el frontend).
export interface RenewVentaPayload {
  precio?: number;
  moneda?: Moneda;
  tasaCambio?: number;
  metodoPago?: string;
}

export interface VentaFilters {
  clienteId?: string;
  servicioId?: string;
  activo?: boolean;
  vencimiento?: VencimientoFiltro;
  diasAlerta?: number;
}

export enum VencimientoFiltro {
  VENCIDA = 'vencida',
  POR_VENCER = 'por_vencer',
  AL_DIA = 'al_dia',
}

export const VENCIMIENTO_LABELS: Record<VencimientoFiltro, string> = {
  [VencimientoFiltro.VENCIDA]: 'Vencidas',
  [VencimientoFiltro.POR_VENCER]: 'Por vencer',
  [VencimientoFiltro.AL_DIA]: 'Al día',
};

export interface SalesSummary {
  vencidas: number;
  porVencer: number;
  alDia: number;
}

export enum AjusteVentaTipo {
  COMPENSACION = 'compensacion',
}

// GET /sales/:id/adjustments y /combo-sales/:id/adjustments: cambios a la
// fecha de vencimiento que no son un pago. Hoy solo los días sumados porque
// la cuenta estuvo caída, del más reciente al más antiguo.
export interface AjusteVenta {
  id: string;
  ventaId: string | null;
  ventaComboId: string | null;
  cuentaId: string;
  tipo: AjusteVentaTipo;
  dias: number;
  fechaCaida: string;
  fechaReposicion: string;
  motivo: string | null;
  createdAt: string;
}
