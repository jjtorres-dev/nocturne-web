import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

// Estado vacío de listas: una línea en un panel, con ícono, mensaje y
// submensaje opcional. `bueno`: el vacío es buena noticia (ícono en verde).
@Component({
  imports: [MatIconModule],
  selector: 'app-empty-state',
  host: { '[class.bueno]': 'bueno()' },
  styleUrl: './empty-state.scss',
  templateUrl: './empty-state.html',
})
export class EmptyState {
  readonly icon = input('inbox');
  readonly mensaje = input.required<string>();
  readonly submensaje = input<string>();
  readonly bueno = input(false);
}
