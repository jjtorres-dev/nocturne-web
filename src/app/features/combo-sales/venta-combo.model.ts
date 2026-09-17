import type { Moneda } from '../sales/venta.model';
import type { Servicio } from '../services/servicio.model';
import type { Cuenta } from '../accounts/cuenta.model';
import type { Perfil } from '../accounts/profiles/perfil.model';
import type { Owner } from '../../shared/owner.model';

// Una "venta hija" del combo (fila de la tabla sales con ventaComboId
// seteado). Solo aparece con las relaciones servicio/cuenta/perfil
// resueltas en GET /combo-sales/:id (ver ComboSalesService.findOne).
export interface VentaComboSaleItem {
  id: string;
  servicioId: string;
  servicio?: Servicio;
  cuentaId: string;
  cuenta?: Cuenta;
  perfilId: string | null;
  perfil?: Perfil | null;
  clienteId: string;
  fechaFin: string;
  activo: boolean;
}

export interface VentaCombo {
  id: string;
  clienteId: string;
  comboId: string;
  codigoVenta: string;
  fechaInicio: string;
  fechaFin: string;
  duracionMeses: number;
  precio: number;
  moneda: Moneda;
  tasaCambio: number;
  precioPEN: number;
  metodoPago: string;
  renovacionAutomatica: boolean;
  activo: boolean;
  // Solo presente en GET /combo-sales/:id, no en el listado.
  ventas?: VentaComboSaleItem[];
  owner: Owner;
  createdAt: string;
  updatedAt: string;
}

export interface VentaComboAsignacionPayload {
  servicioId: string;
  cuentaId: string;
  perfilId?: string;
}

export interface CreateVentaComboPayload {
  clienteId: string;
  comboId: string;
  fechaInicio: string;
  fechaFin: string;
  duracionMeses: number;
  precio?: number;
  moneda: Moneda;
  tasaCambio?: number;
  metodoPago: string;
  renovacionAutomatica?: boolean;
  asignaciones: VentaComboAsignacionPayload[];
}

// Igual criterio que UpdateVentaPayload: clienteId/comboId/asignaciones no
// son editables por PATCH, eso pasa por desactivar + crear un combo nuevo.
export interface UpdateVentaComboPayload {
  fechaFin?: string;
  precio?: number;
  moneda?: Moneda;
  tasaCambio?: number;
  metodoPago?: string;
  renovacionAutomatica?: boolean;
}

export interface VentaComboFilters {
  clienteId?: string;
  comboId?: string;
  activo?: boolean;
}
