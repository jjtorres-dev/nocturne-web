export enum TimelineGroupBy {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export interface AccountingSummary {
  ingresos: number;
  inversion: number;
  gastos: number;
  ganancia: number;
}

export interface ServiceBreakdown {
  servicioId: string;
  nombre: string;
  inversion: number;
  ingresos: number;
  ganancia: number;
}

export interface PaymentMethodBreakdown {
  metodoPago: string;
  ingresos: number;
  gastos: number;
  neto: number;
}

// ganancia = ingresos - inversion - gastos, igual que en el resumen.
export interface TimelinePoint {
  periodo: string;
  ingresos: number;
  inversion: number;
  gastos: number;
  ganancia: number;
}

export interface AccountingRangeFilters {
  desde?: string;
  hasta?: string;
  // Solo tiene efecto para ADMIN (ver AccountingService.resolveOwnerId en
  // nocturne-api): 'all' quita el filtro de dueño, un id de usuario filtra
  // por ese dueño en vez del propio admin, y ausente = "mi negocio".
  viewOwnerId?: string;
}
