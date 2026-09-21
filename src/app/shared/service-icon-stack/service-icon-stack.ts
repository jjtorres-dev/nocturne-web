import { Component, computed, input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ServiceIcon } from '../service-icon/service-icon';

interface StackItem {
  id: string;
  nombre: string;
}

// Íconos/avatares de los servicios de un combo, superpuestos ligeramente. Pasado
// `max` muestra un "+N". Cada ícono lleva tooltip y aria-label con el nombre,
// porque acá no hay texto al lado que lo identifique.
@Component({
  imports: [MatTooltipModule, ServiceIcon],
  selector: 'app-service-icon-stack',
  styleUrl: './service-icon-stack.scss',
  templateUrl: './service-icon-stack.html',
})
export class ServiceIconStack {
  readonly servicios = input.required<readonly StackItem[]>();
  readonly size = input(28);
  readonly max = input(5);

  protected readonly visibles = computed(() => this.servicios().slice(0, this.max()));
  protected readonly ocultos = computed(() => this.servicios().slice(this.max()));
  protected readonly ocultosLabel = computed(() =>
    this.ocultos()
      .map((s) => s.nombre)
      .join(', '),
  );
}
