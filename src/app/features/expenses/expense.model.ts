import { Moneda } from '../sales/venta.model';
import type { Owner } from '../../shared/owner.model';

export interface Gasto {
  id: string;
  descripcion: string;
  monto: number;
  moneda: Moneda;
  tasaCambio: number;
  montoPEN: number;
  metodoPago: string;
  fecha: string;
  activo: boolean;
  owner: Owner;
  createdAt: string;
  updatedAt: string;
}

export interface GastoPayload {
  descripcion: string;
  monto: number;
  moneda: Moneda;
  tasaCambio?: number;
  metodoPago: string;
  fecha: string;
}

export interface GastoFilters {
  activo?: boolean;
}
