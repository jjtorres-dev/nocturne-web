export interface Perfil {
  id: string;
  cuentaId: string;
  nombre: string;
  pin: string | null;
  clienteId: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PerfilPayload {
  nombre: string;
  pin?: string;
  clienteId?: string;
}

export interface PerfilFilters {
  activo?: boolean;
}
