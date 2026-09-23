import { Component, input, signal } from '@angular/core';

let nextId = 0;

// Explicación larga de un campo, oculta por defecto. La muestra/oculta un
// InfoToggle (ícono ⓘ) con click o toque — a diferencia de un tooltip con
// hover, funciona igual en celular. Se ubica debajo del campo, fuera del
// mat-form-field: un mat-hint largo no entra en el subscript y se monta
// sobre el campo siguiente.
@Component({
  selector: 'app-info-hint',
  styleUrl: './info-hint.scss',
  templateUrl: './info-hint.html',
})
export class InfoHint {
  readonly texto = input.required<string>();
  readonly abierto = signal(false);
  readonly id = `info-hint-${nextId++}`;

  toggle(): void {
    this.abierto.update((v) => !v);
  }
}
