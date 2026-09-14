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

export interface TimelinePoint {
  periodo: string;
  ingresos: number;
  gastos: number;
  ganancia: number;
}

export interface AccountingRangeFilters {
  desde?: string;
  hasta?: string;
}
