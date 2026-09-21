import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

// Estado vacío de listas: ícono grande atenuado + mensaje + submensaje opcional.
@Component({
  imports: [MatIconModule],
  selector: 'app-empty-state',
  styleUrl: './empty-state.scss',
  templateUrl: './empty-state.html',
})
export class EmptyState {
  readonly icon = input('inbox');
  readonly mensaje = input.required<string>();
  readonly submensaje = input<string>();
}
