import {
  Component,
  OnInit,
  type WritableSignal,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VentasApi } from '../sales/ventas-api';
import { VencimientoFiltro, type SalesSummary } from '../sales/venta.model';
import { DashboardApi } from './dashboard-api';
import type { InventarioItem } from './inventario.model';
import { CuentasApi } from '../accounts/cuentas-api';
import type { CuentaPorRenovar } from '../accounts/cuenta.model';
import { AccountingApi } from '../accounting/accounting-api';
import type { AccountingSummary } from '../accounting/accounting.model';
import { ServiceIcon } from '../../shared/service-icon/service-icon';
import { SolesPipe } from '../../shared/soles.pipe';

// Estado de cada tarjeta secundaria: se cargan en paralelo y por separado
// (una que falle muestra su propio error sin tapar a las demás).
interface CardState<T> {
  loading: boolean;
  error: boolean;
  data: T | null;
}

function initialState<T>(): CardState<T> {
  return { loading: true, error: false, data: null };
}

@Component({
  imports: [
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ServiceIcon,
    SolesPipe,
  ],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private readonly ventasApi = inject(VentasApi);
  private readonly dashboardApi = inject(DashboardApi);
  private readonly cuentasApi = inject(CuentasApi);
  private readonly accountingApi = inject(AccountingApi);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly VencimientoFiltro = VencimientoFiltro;

  readonly summary = signal<SalesSummary | null>(null);
  readonly loading = signal(false);
  readonly ganancia = signal(initialState<AccountingSummary>());
  readonly inventario = signal(initialState<InventarioItem[]>());
  readonly porRenovar = signal(initialState<CuentaPorRenovar[]>());

  ngOnInit(): void {
    void this.refresh();
    // Sin viewOwnerId: el backend devuelve "lo mío" (también para ADMIN) y
    // sin desde/hasta, el mes calendario actual.
    void this.load(this.ganancia, () => this.accountingApi.summary());
    void this.load(this.inventario, () => this.dashboardApi.inventario());
    void this.load(this.porRenovar, () => this.cuentasApi.porRenovar());
  }

  async refresh(): Promise<void> {
    this.loading.set(true);
    try {
      this.summary.set(await this.ventasApi.summary());
    } catch {
      this.snackBar.open('No se pudo cargar el resumen de ventas.', 'Cerrar', {
        duration: 4000,
      });
    } finally {
      this.loading.set(false);
    }
  }

  goToVencimientos(estado: VencimientoFiltro): void {
    void this.router.navigate(['/vencimientos'], {
      queryParams: { estado },
    });
  }

  diasLabel(dias: number): string {
    if (dias < 0) {
      return dias === -1 ? 'Venció ayer' : `Venció hace ${-dias} días`;
    }
    if (dias === 0) {
      return 'Vence hoy';
    }
    return dias === 1 ? 'Vence mañana' : `Vence en ${dias} días`;
  }

  clientesLabel(n: number): string {
    return n === 1 ? '1 cliente la usa' : `${n} clientes la usan`;
  }

  private async load<T>(
    state: WritableSignal<CardState<T>>,
    fetch: () => Promise<T>,
  ): Promise<void> {
    state.set(initialState<T>());
    try {
      state.set({ loading: false, error: false, data: await fetch() });
    } catch {
      state.set({ loading: false, error: true, data: null });
    }
  }
}
