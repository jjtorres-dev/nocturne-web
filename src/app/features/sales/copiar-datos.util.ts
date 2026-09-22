import { formatFechaCorta } from '../../shared/fecha.util';

// Datos de UNA cuenta/perfil para reenviarle al cliente (ver Bloque B,
// punto 3 en PROGRESS.md). Texto plano armado acá, nunca en una URL (ni
// wa.me): la contraseña quedaría en el historial del navegador.
export interface DatosParaCliente {
  servicioNombre: string;
  correo: string;
  // null: proveedor que solo da un código, sin contraseña — se omite la
  // línea de Contraseña.
  claveServicio: string | null;
  // null en ambos: servicio SIN_PERFILES (la venta no tiene perfilId) — se
  // omiten Perfil y PIN. perfilPin null con perfilNombre presente: el
  // perfil no tiene PIN cargado — se omite solo la línea de PIN.
  perfilNombre: string | null;
  perfilPin: string | null;
  fechaFin: string;
}

export function formatearDatosParaCliente(datos: DatosParaCliente): string {
  const lineas = [`Servicio: ${datos.servicioNombre}`, `Correo: ${datos.correo}`];
  if (datos.claveServicio) {
    lineas.push(`Contraseña: ${datos.claveServicio}`);
  }
  if (datos.perfilNombre) {
    lineas.push(`Perfil: ${datos.perfilNombre}`);
    if (datos.perfilPin) {
      lineas.push(`PIN: ${datos.perfilPin}`);
    }
  }
  lineas.push(`Vence: ${formatFechaCorta(datos.fechaFin)}`);
  return lineas.join('\n');
}

// Venta Combo: junta los datos de todas las cuentas del combo en un solo
// mensaje, un bloque por cuenta separado por línea en blanco.
export function formatearDatosParaClienteCombo(
  items: DatosParaCliente[],
): string {
  return items.map(formatearDatosParaCliente).join('\n\n');
}
