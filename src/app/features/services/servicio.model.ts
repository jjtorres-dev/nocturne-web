import type { Owner } from '../../shared/owner.model';

export enum ServiceType {
  CON_PERFILES = 'CON_PERFILES',
  SIN_PERFILES = 'SIN_PERFILES',
  FAMILIAR = 'FAMILIAR',
  IPTV = 'IPTV',
}

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  [ServiceType.CON_PERFILES]: 'Con perfiles',
  [ServiceType.SIN_PERFILES]: 'Sin perfiles',
  [ServiceType.FAMILIAR]: 'Familiar',
  [ServiceType.IPTV]: 'IPTV',
};

export interface Servicio {
  id: string;
  nombre: string;
  tipo: ServiceType;
  duracionMeses: number;
  pantallasMax: number | null;
  precioBase: number;
  activo: boolean;
  owner: Owner;
  createdAt: string;
  updatedAt: string;
}

export interface ServicioPayload {
  nombre: string;
  tipo: ServiceType;
  duracionMeses: number;
  pantallasMax: number | null;
  precioBase: number;
}

export interface ServicioFilters {
  tipo?: ServiceType;
  activo?: boolean;
}
