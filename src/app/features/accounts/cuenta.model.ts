import type { Owner } from '../../shared/owner.model';

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
