import { Component, computed, input } from '@angular/core';
import { colorAvatar, iniciales } from './avatar-inicial.util';

// Decorativo (aria-hidden): siempre se usa junto al nombre en texto.
@Component({
  selector: 'app-avatar-inicial',
  styleUrl: './avatar-inicial.scss',
  templateUrl: './avatar-inicial.html',
})
export class AvatarInicial {
  readonly nombre = input.required<string>();
  readonly size = input(28);

  protected readonly texto = computed(() => iniciales(this.nombre()));
  protected readonly color = computed(() => colorAvatar(this.nombre()));
}
