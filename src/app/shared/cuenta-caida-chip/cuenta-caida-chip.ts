import { Component } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';

// Chip "Cuenta caída": la cuenta de esa venta dejó de funcionar y el
// proveedor todavía no la repuso — el cliente está sin servicio y no hay
// que cobrarle. Mismo texto y color en Ventas, Vencimientos y Ventas de
// combos (estilo `.chip-caida` en styles.scss).
@Component({
  imports: [MatChipsModule],
  selector: 'app-cuenta-caida-chip',
  template: `<mat-chip class="chip-caida">Cuenta caída</mat-chip>`,
})
export class CuentaCaidaChip {}
