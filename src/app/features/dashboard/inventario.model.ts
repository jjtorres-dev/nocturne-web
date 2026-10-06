// GET /dashboard/inventario: libres para vender por servicio activo.
export interface InventarioItem {
  servicioId: string;
  nombre: string;
  // true: `libres` son perfiles; false: cuentas completas (SIN_PERFILES/
  // IPTV).
  usaPerfiles: boolean;
  libres: number;
  // Libres + ocupados, en la misma unidad que `libres`. Opcional: un
  // backend anterior al rediseño no lo manda.
  total?: number;
  // Solo llega para ADMIN (ve los servicios de todos).
  ownerName?: string;
}
