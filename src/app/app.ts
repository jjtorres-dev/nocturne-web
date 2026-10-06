import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Theme } from './core/theme/theme';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  // El tema vive en toda la app, login incluido: sigue al dispositivo aunque
  // no haya menú de usuario a la vista.
  private readonly theme = inject(Theme);
}
