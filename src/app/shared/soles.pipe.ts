import { LOCALE_ID, Pipe, PipeTransform, inject } from '@angular/core';
import { formatNumber } from '@angular/common';

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
    return `S/ ${formatNumber(value, this.locale, '1.2-2')}`;
  }
}
