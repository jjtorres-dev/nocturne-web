import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { InfoHint } from './info-hint';

// Botón ⓘ que abre/cierra el InfoHint indicado en `for`. Se puede usar como
// matSuffix de un mat-form-field o suelto junto a un checkbox o título.
@Component({
  imports: [MatButtonModule, MatIconModule],
  selector: 'app-info-toggle',
  styleUrl: './info-toggle.scss',
  templateUrl: './info-toggle.html',
})
export class InfoToggle {
  readonly for = input.required<InfoHint>();
  readonly etiqueta = input('Más información');

  toggle(event: Event): void {
    // Dentro de un mat-form-field el click también enfocaría el input.
    event.stopPropagation();
    this.for().toggle();
  }
}
