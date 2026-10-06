import { VencimientoFiltro } from './venta.model';

export type VencimientoRecordatorio =
  | VencimientoFiltro.VENCIDA
  | VencimientoFiltro.POR_VENCER;

export interface RecordatorioParams {
  cliente: string;
  servicio: string;
  fechaFin: string;
  dias: number;
}

export function limpiarNumeroWhatsapp(numero: string): string {
  const soloDigitos = numero.replace(/\D/g, '');
  if (soloDigitos.length === 9) {
    return `51${soloDigitos}`;
  }
  return soloDigitos;
}

function formatFechaEs(fechaIso: string): string {
  const [anio, mes, dia] = fechaIso.split('-');
  return `${dia}/${mes}/${anio}`;
}

export function mensajeRenovacion(
  vencimiento: VencimientoRecordatorio,
  { cliente, servicio, fechaFin, dias }: RecordatorioParams,
): string {
  const fecha = formatFechaEs(fechaFin);
  if (vencimiento === VencimientoFiltro.VENCIDA) {
    return `Hola ${cliente}, tu servicio de ${servicio} venció el ${fecha}. ¿Deseas renovarlo?`;
  }
  return `Hola ${cliente}, tu servicio de ${servicio} vence el ${fecha} (en ${dias} días). ¿Deseas renovarlo?`;
}

export function whatsappRenewalUrl(
  numero: string,
  vencimiento: VencimientoRecordatorio,
  params: RecordatorioParams,
): string {
  const mensaje = mensajeRenovacion(vencimiento, params);
  return `https://wa.me/${limpiarNumeroWhatsapp(numero)}?text=${encodeURIComponent(mensaje)}`;
}

// Chat con un contacto, sin mensaje escrito de antemano.
export function whatsappChatUrl(numero: string): string {
  return `https://wa.me/${limpiarNumeroWhatsapp(numero)}`;
}
