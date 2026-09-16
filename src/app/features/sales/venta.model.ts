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
