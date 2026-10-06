import { LOCALE_ID, Pipe, PipeTransform, inject } from '@angular/core';
import { formatNumber } from '@angular/common';

// Monto en soles con 2 decimales. En los negativos el signo va delante de la
// moneda ("−S/ 253.00"), con el signo menos tipográfico, igual que en el eje
// del gráfico de Contabilidad. Un monto que redondea a cero no lleva signo.
export function formatSoles(value: number, locale = 'en-US'): string {
  const monto = `S/ ${formatNumber(Math.abs(value), locale, '1.2-2')}`;
  return value < 0 && Number(value.toFixed(2)) !== 0 ? `−${monto}` : monto;
}

// CurrencyPipe con 'PEN' cae al código ISO ("PEN") en vez de "S/" porque el
// símbolo narrow de soles no está en la tabla de en-US (LOCALE_ID por
// defecto en este proyecto, que nunca registró es-PE). Los reportes de
// Contabilidad son siempre soles, así que se antepone el símbolo a mano en
// vez de depender de datos de locale que no están cargados.
@Pipe({ name: 'soles', standalone: true })
export class SolesPipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);

  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }
    return formatSoles(value, this.locale);
  }
}
