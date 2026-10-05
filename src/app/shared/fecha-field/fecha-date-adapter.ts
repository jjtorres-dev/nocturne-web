import { Injectable } from '@angular/core';
import { NativeDateAdapter, type MatDateFormats } from '@angular/material/core';

// Idioma de los calendarios (nombres de meses y días): español de Perú. Es
// solo para MAT_DATE_LOCALE de FechaField — el LOCALE_ID de la app no se
// toca (SolesPipe, montos, CSV y fechas de las listas siguen igual).
export const FECHA_LOCALE = 'es-PE';

// Formato del texto del campo. No es un patrón que interprete Intl: es la
// marca con la que FechaDateAdapter reconoce "el texto del input" y lo
// arma/lee a mano como dd/mm/aaaa.
const FORMATO_INPUT = 'dd/MM/yyyy';

export const FECHA_DATE_FORMATS: MatDateFormats = {
  parse: { dateInput: FORMATO_INPUT },
  display: {
    dateInput: FORMATO_INPUT,
    monthYearLabel: { year: 'numeric', month: 'long' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
};

// 'YYYY-MM-DD' (el valor de los formularios y de la API) -> Date a
// medianoche LOCAL. Nunca `new Date('YYYY-MM-DD')`: eso es medianoche UTC y
// en Perú (UTC-5) cae en el día anterior. null si no es una fecha real.
export function isoADate(fechaIso: string | null | undefined): Date | null {
  const partes = /^(\d{4})-(\d{2})-(\d{2})/.exec(fechaIso ?? '');
  if (!partes) {
    return null;
  }
  return fechaLocal(Number(partes[1]), Number(partes[2]), Number(partes[3]));
}

// Date -> 'YYYY-MM-DD' con los componentes LOCALES. Nunca `toISOString()`:
// convierte a UTC y corre la fecha un día según la hora y la zona.
export function dateAIso(fecha: Date | null | undefined): string {
  if (!fecha || Number.isNaN(fecha.getTime())) {
    return '';
  }
  const yyyy = String(fecha.getFullYear()).padStart(4, '0');
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// null si el día no existe (31/02, mes 13…): `new Date` lo desbordaría al
// mes siguiente en silencio.
function fechaLocal(anio: number, mes: number, dia: number): Date | null {
  const fecha = new Date(2000, mes - 1, dia);
  // setFullYear y no el constructor: `new Date(26, …)` es 1926.
  fecha.setFullYear(anio, mes - 1, dia);
  const existe =
    fecha.getFullYear() === anio && fecha.getMonth() === mes - 1 && fecha.getDate() === dia;
  return existe ? fecha : null;
}

// Adaptador de fechas de FechaField. El nativo de Material ya da los nombres
// de meses y días en el idioma de MAT_DATE_LOCALE, pero lee lo que se
// escribe a mano con `Date.parse`, que entiende 05/03/2026 como 3 de mayo
// (mes/día, a la gringa). Acá el texto se lee y se arma siempre como
// día/mes/año, y la semana empieza en lunes.
@Injectable()
export class FechaDateAdapter extends NativeDateAdapter {
  override getFirstDayOfWeek(): number {
    return 1;
  }

  // Contrato de DateAdapter.parse: null si está vacío, fecha inválida si
  // hay texto que no es una fecha (así el campo sabe que hay un error de
  // formato). El año va con 4 dígitos: con 2, a medio escribir "05/03/20"
  // ya sería una fecha (2020) y dispararía los autocompletados.
  override parse(value: unknown): Date | null {
    if (value instanceof Date) {
      return this.isValid(value) ? this.clone(value) : this.invalid();
    }
    if (typeof value !== 'string' || value.trim() === '') {
      return null;
    }
    const partes = /^(\d{1,2})\s*[/.-]\s*(\d{1,2})\s*[/.-]\s*(\d{4})$/.exec(value.trim());
    if (!partes) {
      return this.invalid();
    }
    return fechaLocal(Number(partes[3]), Number(partes[2]), Number(partes[1])) ?? this.invalid();
  }

  override format(date: Date, displayFormat: object | string): string {
    if (displayFormat !== FORMATO_INPUT) {
      return super.format(date, displayFormat as object);
    }
    if (!this.isValid(date)) {
      throw new Error('FechaDateAdapter: no se puede dar formato a una fecha inválida.');
    }
    const [yyyy, mm, dd] = dateAIso(date).split('-');
    return `${dd}/${mm}/${yyyy}`;
  }
}
