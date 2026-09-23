import { Component, computed, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { ESTADO_VENTA_LABELS, estadoVenta } from './estado-venta.util';

// Chip de estado de una venta o venta de combo: Vigente / Vencida (en el
// rojo de Vencimientos) / Finalizada. Ver estadoVenta().
@Component({
  imports: [MatChipsModule],
  selector: 'app-estado-venta',
  templateUrl: './estado-venta.html',
})
export class EstadoVentaChip {
  readonly venta = input.required<{ activo: boolean; fechaFin: string }>();

  protected readonly estado = computed(() => estadoVenta(this.venta()));
  protected readonly label = computed(() => ESTADO_VENTA_LABELS[this.estado()]);
}
