// Lista fija de métodos de pago, en el orden en que se ofrecen en el
// selector. El campo del backend sigue siendo texto plano: esto es un atajo
// de UI, no un enum — ver MetodoPagoSelect.
export const METODO_PAGO_OPTIONS: readonly string[] = [
  'Yape',
  'Plin',
  'Transferencia bancaria',
  'Tarjeta',
  'PayPal',
  'Zelle',
  'Mercado Pago',
  'Binance/Cripto',
  'Efectivo',
];

// Sentinel de UI para "Otro" (texto libre): solo identifica la opción
// seleccionada en el <mat-select> internamente. Nunca es el valor que
// MetodoPagoSelect expone al FormControl — ese siempre es la etiqueta fija
// o el texto que se escribió.
export const METODO_PAGO_OTRO = '__otro__';
