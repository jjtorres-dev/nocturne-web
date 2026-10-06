import type { Owner } from '../../shared/owner.model';

export enum ServiceType {
  CON_PERFILES = 'CON_PERFILES',
  SIN_PERFILES = 'SIN_PERFILES',
  FAMILIAR = 'FAMILIAR',
  IPTV = 'IPTV',
}

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  [ServiceType.CON_PERFILES]: 'Por perfiles (una cuenta, varios clientes)',
  [ServiceType.SIN_PERFILES]: 'Cuenta completa (un cliente por cuenta)',
  [ServiceType.FAMILIAR]: 'Plan familiar (por cupos)',
  [ServiceType.IPTV]: 'IPTV (cuenta completa)',
};

// El mismo dato en corto, sin la explicación: para la lista, donde va en
// una columna. La explicación completa queda en el formulario.
export const SERVICE_TYPE_SHORT_LABELS: Record<ServiceType, string> = {
  [ServiceType.CON_PERFILES]: 'Por perfiles',
  [ServiceType.SIN_PERFILES]: 'Cuenta completa',
  [ServiceType.FAMILIAR]: 'Plan familiar',
  [ServiceType.IPTV]: 'IPTV',
};

// Tipos que se venden por perfil (en FAMILIAR cada cupo del plan es un
// perfil): son los únicos con pantallasMax — mismo criterio que el backend
// para `usaPerfiles`.
export const TIPOS_CON_PERFILES: readonly ServiceType[] = [
  ServiceType.CON_PERFILES,
  ServiceType.FAMILIAR,
];

export function usaPerfiles(tipo: ServiceType): boolean {
  return TIPOS_CON_PERFILES.includes(tipo);
}

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
