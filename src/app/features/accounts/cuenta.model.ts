export interface Cuenta {
  id: string;
  servicioId: string;
  proveedorId: string | null;
  clienteId: string | null;
  correo: string;
  claveServicio: string;
  claveCorreo: string | null;
  fechaInicio: string;
  fechaFin: string;
  costo: number;
  metodoPago: string;
  url: string | null;
  renovacionAutomatica: boolean;
  activo: boolean;
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
  createdAt: string;
  updatedAt: string;
}

export interface CuentaPayload {
  servicioId: string;
  proveedorId?: string;
  correo: string;
  claveServicio: string;
  claveCorreo?: string;
  fechaInicio: string;
  fechaFin: string;
  costo: number;
  metodoPago: string;
  url?: string;
  renovacionAutomatica?: boolean;
}

export interface CuentaFilters {
  servicioId?: string;
  proveedorId?: string;
  activo?: boolean;
}
