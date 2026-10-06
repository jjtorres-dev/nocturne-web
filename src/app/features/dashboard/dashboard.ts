import {
  Component,
  type ElementRef,
  OnInit,
  type WritableSignal,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { VentasApi } from '../sales/ventas-api';
import { VencimientoFiltro, type SalesSummary } from '../sales/venta.model';
import { DashboardApi } from './dashboard-api';
import type { InventarioItem } from './inventario.model';
import { CuentasApi } from '../accounts/cuentas-api';
import type { Cuenta, CuentaCaida, CuentaPorRenovar } from '../accounts/cuenta.model';
import { CuentaRenovarProveedorDialog } from '../accounts/cuenta-renovar-proveedor-dialog/cuenta-renovar-proveedor-dialog';
import {
  clientesTexto,
  diasEntre,
  diasTexto,
  formatFechaCorta,
  hoyIso,
} from '../../shared/fecha.util';
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

// Tope de butacas dibujadas por servicio en "Disponible para vender": con
// más que esto, la sala se dibuja hasta acá y el texto dice cuántas son.
const MAX_BUTACAS = 40;

@Component({
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
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
  private readonly dialog = inject(MatDialog);

  protected readonly VencimientoFiltro = VencimientoFiltro;

  readonly summary = signal<SalesSummary | null>(null);
  readonly loading = signal(false);
  readonly ganancia = signal(initialState<AccountingSummary>());
  readonly inventario = signal(initialState<InventarioItem[]>());
  readonly porRenovar = signal(initialState<CuentaPorRenovar[]>());
  readonly caidas = signal(initialState<CuentaCaida[]>());

  // "Disponible para vender" separa lo que se vende por perfil de lo que se
  // vende por cuenta completa: son unidades distintas y no se mezclan en una
  // misma lista.
  protected readonly inventarioGrupos = computed(() => {
    const items = this.inventario().data ?? [];
    return [
      { titulo: 'Se venden por perfil', items: items.filter((i) => i.usaPerfiles) },
      { titulo: 'Se venden por cuenta completa', items: items.filter((i) => !i.usaPerfiles) },
    ].filter((grupo) => grupo.items.length > 0);
  });

  ngOnInit(): void {
    void this.refresh();
    // Sin viewOwnerId: el backend devuelve "lo mío" (también para ADMIN) y
    // sin desde/hasta, el mes calendario actual.
    void this.load(this.ganancia, () => this.accountingApi.summary());
    void this.load(this.inventario, () => this.dashboardApi.inventario());
    void this.load(this.porRenovar, () => this.cuentasApi.porRenovar());
    void this.load(this.caidas, () => this.cuentasApi.caidas());
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

  private readonly caidasPanel = viewChild<ElementRef<HTMLElement>>('caidasPanel');

  // Marca por un momento el panel "Cuentas caídas" al llegar desde su tarjeta
  // de estado (ver verCaidas).
  protected readonly caidasDestacada = signal(false);

  // La tarjeta de estado "Cuentas caídas" lleva a su lista, en esta
  // misma pantalla: las caídas son cuentas, no ventas, así que no tienen
  // filtro en Vencimientos. El panel se resalta un momento para que se vea
  // adónde llevó el toque aunque ya estuviera a la vista.
  verCaidas(): void {
    const panel = this.caidasPanel()?.nativeElement;
    panel?.scrollIntoView?.({ block: 'start' });
    panel?.focus({ preventScroll: true });
    this.caidasDestacada.set(true);
    setTimeout(() => this.caidasDestacada.set(false), 1200);
  }

  // Una butaca por perfil (o cuenta completa) del servicio: primero las
  // ocupadas (false), después las libres (true). Si el backend todavía no
  // manda `total`, solo se conocen las libres.
  butacas(item: InventarioItem): boolean[] {
    const total = Math.max(item.total ?? item.libres, item.libres);
    const dibujadas = Math.min(total, MAX_BUTACAS);
    const libres = Math.min(item.libres, dibujadas);
    return Array.from({ length: dibujadas }, (_, i) => i >= dibujadas - libres);
  }

  // "Libres: 3 de 4 perfiles" / "Libres: 0 de 1 cuenta". La unidad va
  // siempre escrita: perfiles y cuentas completas no son lo mismo.
  libresLabel(item: InventarioItem): string {
    const unidad = (n: number) =>
      item.usaPerfiles ? (n === 1 ? 'perfil' : 'perfiles') : n === 1 ? 'cuenta' : 'cuentas';
    return item.total === undefined
      ? `Libres: ${item.libres} ${unidad(item.libres)}`
      : `Libres: ${item.libres} de ${item.total} ${unidad(item.total)}`;
  }

  goToVencimientos(estado: VencimientoFiltro): void {
    void this.router.navigate(['/vencimientos'], {
      queryParams: { estado },
    });
  }

  // Al renovar, la cuenta sale de la lista (su nueva fecha ya no vence
  // pronto) y cambia lo pagado a proveedores del mes: se recargan las dos
  // tarjetas.
  openRenovarProveedor(cuenta: CuentaPorRenovar): void {
    const ref = this.dialog.open(CuentaRenovarProveedorDialog, {
      data: {
        cuentaId: cuenta.id,
        correo: cuenta.correo,
        servicioNombre: cuenta.servicioNombre,
        fechaFin: cuenta.fechaFin,
      },
    });
    ref.afterClosed().subscribe((result?: Cuenta) => {
      if (result) {
        this.snackBar.open(
          `Cuenta renovada. Ahora vence con el proveedor el ${formatFechaCorta(result.fechaFin)}.`,
          'Cerrar',
          { duration: 4000 },
        );
        void this.load(this.porRenovar, () => this.cuentasApi.porRenovar());
        void this.load(this.ganancia, () => this.accountingApi.summary());
      }
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

  // Con la fecha local de hoy, igual que el aviso del detalle y "Días a
  // compensar" de Reponer cuenta: los tres tienen que decir el mismo número
  // (el `diasCaida` del backend usa el reloj del servidor, que de noche en
  // Perú ya va un día adelante).
  diasCaidaLabel(fechaCaida: string): string {
    const dias = Math.max(0, diasEntre(fechaCaida, hoyIso()));
    return dias === 0 ? 'Se cayó hoy' : `Caída hace ${diasTexto(dias)}`;
  }

  clientesAfectadosLabel(n: number): string {
    return n === 0 ? 'Sin clientes' : `${clientesTexto(n)} sin servicio`;
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
