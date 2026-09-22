import { buildCsv, exportToCsv, type CsvColumn } from './csv-export';

interface Row {
  nombre: string;
  nota: string;
}

const columns: CsvColumn<Row>[] = [
  { header: 'Nombre', value: (r) => r.nombre },
  { header: 'Nota', value: (r) => r.nota },
];

describe('buildCsv', () => {
  it('antepone el BOM UTF-8', () => {
    const csv = buildCsv(columns, [{ nombre: 'Ana', nota: 'ok' }]);
    expect(csv.charAt(0)).toBe('﻿');
  });

  it('usa ; como separador de campos', () => {
    const csv = buildCsv(columns, [{ nombre: 'Ana', nota: 'ok' }]);
    expect(csv).toBe('﻿Nombre;Nota\r\nAna;ok');
  });

  it('escapa un valor que contiene el separador ";"', () => {
    const csv = buildCsv(columns, [{ nombre: 'Pérez; Ana', nota: 'ok' }]);
    expect(csv).toContain('"Pérez; Ana";ok');
  });

  it('escapa un valor con comillas, duplicándolas', () => {
    const csv = buildCsv(columns, [{ nombre: 'Apodo "El Rey"', nota: 'ok' }]);
    expect(csv).toContain('"Apodo ""El Rey""";ok');
  });

  it('escapa un valor con salto de línea', () => {
    const csv = buildCsv(columns, [{ nombre: 'Ana\nLuisa', nota: 'ok' }]);
    expect(csv).toContain('"Ana\nLuisa";ok');
  });

  it('no toca un valor sin caracteres especiales', () => {
    const csv = buildCsv(columns, [{ nombre: 'Ana Luisa', nota: 'ok' }]);
    expect(csv).toContain('Ana Luisa;ok');
    expect(csv).not.toContain('"Ana Luisa"');
  });

  it('con cero filas solo devuelve el header', () => {
    const csv = buildCsv(columns, []);
    expect(csv).toBe('﻿Nombre;Nota');
  });
});

describe('exportToCsv', () => {
  it('crea un blob de tipo text/csv y dispara la descarga con el nombre dado', () => {
    const createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });

    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => ({}) as never);

    exportToCsv('ventas-2026-09-22.csv', columns, [{ nombre: 'Ana', nota: 'ok' }]);

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    expect(blob.type).toBe('text/csv;charset=utf-8;');
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');

    clickSpy.mockRestore();
    vi.unstubAllGlobals();
  });
});
