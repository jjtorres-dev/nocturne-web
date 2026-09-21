import { Component, computed, input } from '@angular/core';
import { AvatarInicial } from '../avatar-inicial/avatar-inicial';
import { resolveServiceIcon } from './service-icon.util';

// Ícono de marca del servicio (por nombre) o, si no hay match, avatar de
// iniciales. Decorativo (aria-hidden): siempre se usa junto al nombre.
@Component({
  imports: [AvatarInicial],
  selector: 'app-service-icon',
  styleUrl: './service-icon.scss',
  templateUrl: './service-icon.html',
})
export class ServiceIcon {
  readonly nombre = input.required<string>();
  readonly size = input(28);

  protected readonly icon = computed(() => resolveServiceIcon(this.nombre()));
}
