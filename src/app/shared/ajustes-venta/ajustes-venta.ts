import { Component, input } from '@angular/core';
import type { AjusteVenta } from '../../features/sales/venta.model';
import { ajusteLabel } from './ajustes-venta.util';

// Historial de ajustes de una venta o venta de combo: los días que se le
// sumaron al vencimiento sin que el cliente pague (hoy, por una cuenta
// caída). Sin ajustes no pinta nada.
@Component({
  selector: 'app-ajustes-venta',
  styleUrl: './ajustes-venta.scss',
  templateUrl: './ajustes-venta.html',
})
export class AjustesVenta {
  readonly ajustes = input.required<AjusteVenta[]>();

  protected readonly label = ajusteLabel;
}
