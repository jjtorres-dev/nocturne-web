import { Component, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { injectIsMobile } from '../breakpoints';

// Filtros de una lista. En escritorio van en una línea, siempre a la vista
// (`.nc-filtros`, ver styles.scss). En celular se guardan detrás de un botón
// "Filtros", que dice cuántos están aplicando, para no ocupar media pantalla
// antes de la primera fila.
@Component({
  imports: [MatButtonModule, MatIconModule],
  selector: 'app-filtros-plegables',
  styleUrl: './filtros-plegables.scss',
  templateUrl: './filtros-plegables.html',
})
export class FiltrosPlegables {
  // Cuántos filtros están aplicando (distintos de "Todos").
  readonly activos = input(0);

  protected readonly isMobile = injectIsMobile();
  protected readonly abierto = signal(false);
  protected readonly panelId = `filtros-${nextId++}`;
}

let nextId = 0;
