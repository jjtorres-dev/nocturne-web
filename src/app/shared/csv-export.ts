export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string;
}

// ';' en vez de ',': es el separador que Excel en español espera por
// defecto (usa ',' como separador decimal, así que reserva ';' para
// campos). Con ',' como separador de campo, Excel en es-* abre el CSV con
// todo en una sola columna.
const FIELD_SEPARATOR = ';';
const ROW_SEPARATOR = '\r\n';
// Sin esto, Excel abre el archivo asumiendo Windows-1252 y las tildes/"ñ"
// salen mal (aunque el archivo esté en UTF-8 real).
const UTF8_BOM = '﻿';

// Regla estándar de CSV (RFC 4180): un campo que contiene el separador,
// comillas o un salto de línea va entre comillas dobles, con las comillas
// internas duplicadas.
function escapeCsvField(value: string): string {
  if (/["\n\r;]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toCsvRow(values: string[]): string {
  return values.map(escapeCsvField).join(FIELD_SEPARATOR);
}

export function buildCsv<T>(columns: CsvColumn<T>[], rows: T[]): string {
  const lines = [
    toCsvRow(columns.map((c) => c.header)),
    ...rows.map((row) => toCsvRow(columns.map((c) => c.value(row)))),
  ];
  return UTF8_BOM + lines.join(ROW_SEPARATOR);
}

// Dispara la descarga en el navegador (Blob + <a> temporal): no le pide
// nada al backend, arma el archivo con lo que ya se tiene cargado en la
// pantalla.
export function exportToCsv<T>(filename: string, columns: CsvColumn<T>[], rows: T[]): void {
  const csv = buildCsv(columns, rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    URL.revokeObjectURL(url);
  }
}
