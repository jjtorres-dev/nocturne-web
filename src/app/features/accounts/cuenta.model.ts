import type { Owner } from '../../shared/owner.model';
import type { Moneda } from '../sales/venta.model';

export interface Cuenta {
  id: string;
  servicioId: string;
  proveedorId: string | null;
  clienteId: string | null;
  correo: string;
  // Puede llegar en null: hay proveedores que solo dan un código, sin
  // contraseña (backend ya lo acepta al crear/editar la cuenta).
  claveServicio: string | null;
  claveCorreo: string | null;
  fechaInicio: string;
  fechaFin: string;
  costo: number;
  metodoPago: string;
  url: string | null;
  renovacionAutomatica: boolean;
  activo: boolean;
  owner: Owner;
  createdAt: string;
  updatedAt: string;
}

// Forma de cada item del listado: nunca incluye claveServicio ni
// claveCorreo (eso solo se expone en el detalle, GET /accounts/:id), pero
// sí trae perfilesCount para mostrar "2/5" en la tabla.
export interface CuentaListItem {
  id: string;
  servicioId: string;
  proveedorId: string | null;
  clienteId: string | null;
  correo: string;
  fechaInicio: string;
  fechaFin: string;
  costo: number;
  metodoPago: string;
  url: string | null;
  renovacionAutomatica: boolean;
  activo: boolean;
  perfilesCount: number;
  owner: Owner;
  createdAt: string;
  updatedAt: string;
}

export interface CuentaPayload {
  servicioId: string;
  proveedorId?: string;
  correo: string;
  // Opcional al crear y al editar: hay proveedores que solo dan un
  // código, sin contraseña (backend ya la acepta vacía en POST y PATCH
  // /accounts).
  claveServicio?: string;
  claveCorreo?: string;
  fechaInicio: string;
  fechaFin: string;
  costo: number;
  metodoPago: string;
  url?: string;
  renovacionAutomatica?: boolean;
  // Solo tiene efecto al crear (el backend lo ignora en editar, ni
  // siquiera se manda ahí — ver CuentaFormDialog): si el servicio elegido
  // tiene pantallasMax, crea "Perfil 1".."Perfil N" junto con la cuenta.
  crearPerfiles?: boolean;
}

export interface CuentaFilters {
  servicioId?: string;
  proveedorId?: string;
  activo?: boolean;
}

// GET /accounts/:id/rentabilidad (todo en PEN). Los ingresos son solo de
// ventas sueltas de la cuenta (inicial + renovaciones): las ventas hijas de
// combo no se reparten por cuenta — `ventasCombo` dice cuántas hay para
// avisarlo.
export interface CuentaRentabilidad {
  // Todo lo pagado al proveedor por la cuenta: compra inicial +
  // renovaciones (suma de sus pagos al proveedor), con el desglose.
  costo: number;
  desgloseCosto: {
    compraInicial: number;
    renovaciones: number;
    cantidadRenovaciones: number;
  };
  perfilesTotal: number;
  perfilesVendidos: number;
  // false en servicios SIN_PERFILES/IPTV: ahí perfilesTotal/Vendidos
  // siempre son 0 y se vende la cuenta completa.
  usaPerfiles: boolean;
  ingresos: number;
  ganancia: number;
  potencial: number;
  ventasCombo: number;
}

// GET /accounts/por-renovar: cuentas activas cuya suscripción con el
// proveedor ya venció o vence dentro de N días (días calculados con la
// fecha del servidor, negativos si ya venció).
export interface CuentaPorRenovar {
  id: string;
  correo: string;
  servicioId: string;
  servicioNombre: string;
  fechaFin: string;
  diasRestantes: number;
  clientesActivos: number;
  // Solo llega para ADMIN.
  ownerName?: string;
}

export enum PagoProveedorTipo {
  COMPRA_INICIAL = 'compra_inicial',
  RENOVACION = 'renovacion',
}

export const PAGO_PROVEEDOR_TIPO_LABELS: Record<PagoProveedorTipo, string> = {
  [PagoProveedorTipo.COMPRA_INICIAL]: 'Compra',
  [PagoProveedorTipo.RENOVACION]: 'Renovación',
};

// GET /accounts/:id/provider-payments: lo pagado al proveedor por la
// cuenta (la compra inicial y cada renovación), del más reciente al más
// antiguo. Contabilidad lo cuenta como "Pagado a proveedores" según `fecha`.
export interface PagoProveedor {
  id: string;
  cuentaId: string;
  fecha: string;
  monto: number;
  moneda: Moneda;
  tasaCambio: number;
  montoPEN: number;
  metodoPago: string;
  tipo: PagoProveedorTipo;
  createdAt: string;
}

// POST /accounts/:id/renew-provider. nuevaFechaFin tiene que ser posterior
// a la fecha de vencimiento actual de la cuenta (si no, 400).
export interface RenovarProveedorPayload {
  monto: number;
  moneda: Moneda;
  tasaCambio: number;
  metodoPago: string;
  fechaPago: string;
  nuevaFechaFin: string;
}
