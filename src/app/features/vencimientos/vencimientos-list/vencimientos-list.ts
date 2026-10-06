import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VentasApi } from '../../sales/ventas-api';
import {
  Moneda,
  VENCIMIENTO_LABELS,
  VencimientoFiltro,
  type Venta,
  type SalesSummary,
} from '../../sales/venta.model';
import { whatsappRenewalUrl } from '../../sales/whatsapp.util';
import { ServiciosApi } from '../../services/servicios-api';
import { type Servicio } from '../../services/servicio.model';
import { ContactosApi } from '../../contacts/contactos-api';
import { type Contacto } from '../../contacts/contacto.model';
import { CuentasApi } from '../../accounts/cuentas-api';
import { type CuentaListItem } from '../../accounts/cuenta.model';
import { PerfilesApi } from '../../accounts/profiles/perfiles-api';
import { VentaCombosApi } from '../../combo-sales/venta-combos-api';
import { VentaRenewDialog } from '../../../shared/venta-renew-dialog/venta-renew-dialog';
import { injectIsMobile } from '../../../shared/breakpoints';
import { SolesPipe } from '../../../shared/soles.pipe';
import { formatFechaCorta } from '../../../shared/fecha.util';
import { EmptyState } from '../../../shared/empty-state/empty-state';
import { CuentaCaidaChip } from '../../../shared/cuenta-caida-chip/cuenta-caida-chip';
import { InfoHint } from '../../../shared/info-hint/info-hint';
import { InfoToggle } from '../../../shared/info-hint/info-toggle';

import { ServiceIcon } from '../../../shared/service-icon/service-icon';

const ESTADOS_VALIDOS = new Set<string>(Object.values(VencimientoFiltro));

@Component({
  imports: [
    CuentaCaidaChip,
    InfoHint,
    InfoToggle,
    EmptyState,
    FormsModule,
    RouterLink,
    DatePipe,
    DecimalPipe,
    SolesPipe,
    ServiceIcon,
    MatTableModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatTooltipModule,
  ],
  selector: 'app-vencimientos-list',
  styleUrl: './vencimientos-list.scss',
  templateUrl: './vencimientos-list.html',
})
export class VencimientosList implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(VentasApi);
  private readonly serviciosApi = inject(ServiciosApi);
  private readonly contactosApi = inject(ContactosApi);
  private readonly cuentasApi = inject(CuentasApi);
  private readonly perfilesApi = inject(PerfilesApi);
  private readonly ventaCombosApi = inject(VentaCombosApi);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly isMobile = injectIsMobile();
  protected readonly Moneda = Moneda;
  protected readonly estados = Object.values(VencimientoFiltro);
  protected readonly estadoLabels = VENCIMIENTO_LABELS;
  protected readonly VencimientoFiltro = VencimientoFiltro;

  // Clase global de estado (styles.scss) de cada pestaña del resumen.
  protected readonly estadoClase: Record<VencimientoFiltro, string> = {
    [VencimientoFiltro.VENCIDA]: 'nc-estado-vencida',
    [VencimientoFiltro.POR_VENCER]: 'nc-estado-por-vencer',
    [VencimientoFiltro.AL_DIA]: 'nc-estado-al-dia',
  };

  protected readonly displayedColumns = ['dias', 'cliente', 'servicio', 'precio', 'acciones'];

  readonly ventas = signal<Venta[]>([]);
  readonly servicios = signal<Servicio[]>([]);
  readonly clientes = signal<Contacto[]>([]);
  readonly cuentas = signal<CuentaListItem[]>([]);
  readonly perfilNombres = signal<Map<string, string>>(new Map());
  readonly comboCodigos = signal<Map<string, string>>(new Map());
  readonly loading = signal(false);
  // La última carga falló: en vez de la lista se muestra el aviso con
  // "Reintentar".
  readonly error = signal(false);
  // Conteo de cada estado para las pestañas (mismo endpoint que Inicio, con
  // los días de aviso de esta pantalla). null: todavía no llegó o falló; las
  // pestañas funcionan igual, solo sin número.
  readonly resumen = signal<SalesSummary | null>(null);

  estado: VencimientoFiltro = VencimientoFiltro.VENCIDA;
  diasAlerta = 3;

  ngOnInit(): void {
    const estadoParam = this.route.snapshot.queryParamMap.get('estado');
    if (estadoParam && ESTADOS_VALIDOS.has(estadoParam)) {
      this.estado = estadoParam as VencimientoFiltro;
    }

    void this.loadOptions();
    void this.refresh();
  }

  private async loadOptions(): Promise<void> {
    const [servicios, clientes, cuentas, ventasCombo] = await Promise.all([
      this.serviciosApi.list(),
      this.contactosApi.list(),
      this.cuentasApi.list(),
      this.ventaCombosApi.list(),
    ]);
    this.servicios.set(servicios);
    this.clientes.set(clientes);
    this.cuentas.set(cuentas);
    this.comboCodigos.set(
      new Map(ventasCombo.map((vc) => [vc.id, vc.codigoVenta])),
    );
  }

  async refresh(): Promise<void> {
    this.loading.set(true);
    this.error.set(false);
    void this.loadResumen();
    try {
      const data = await this.api.list({
        vencimiento: this.estado,
        diasAlerta: this.diasAlerta,
      });
      this.ventas.set(this.ordenar(data));
      await this.loadPerfilNombres(data);
    } catch {
      // El aviso va en el lugar de la lista, con "Reintentar" (sin snackbar:
      // sería el mismo mensaje dos veces).
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  // Lo más cercano a hoy va primero: en "Por vencer" y "Al día", lo que
  // vence antes; en "Vencidas", lo que venció más recientemente. Las fechas
  // son 'YYYY-MM-DD', así que comparar los strings es comparar las fechas.
  private ordenar(ventas: Venta[]): Venta[] {
    const sentido = this.estado === VencimientoFiltro.VENCIDA ? -1 : 1;
    return [...ventas].sort((a, b) => sentido * a.fechaFin.localeCompare(b.fechaFin));
  }

  private async loadResumen(): Promise<void> {
    try {
      this.resumen.set(await this.api.summary(this.diasAlerta));
    } catch {
      this.resumen.set(null);
    }
  }

  protected conteo(estado: VencimientoFiltro): number | null {
    const r = this.resumen();
    if (!r) {
      return null;
    }
    return {
      [VencimientoFiltro.VENCIDA]: r.vencidas,
      [VencimientoFiltro.POR_VENCER]: r.porVencer,
      [VencimientoFiltro.AL_DIA]: r.alDia,
    }[estado];
  }

  // Color del cuándo de una fila: vencida si ya pasó; si no, el de la
  // pestaña en la que está.
  protected cuandoClase(dias: number): string {
    return dias < 0
      ? this.estadoClase[VencimientoFiltro.VENCIDA]
      : this.estadoClase[
          this.estado === VencimientoFiltro.VENCIDA ? VencimientoFiltro.AL_DIA : this.estado
        ];
  }

  protected vacioMensaje(): string {
    return {
      [VencimientoFiltro.VENCIDA]: 'Ningún cliente tiene una venta vencida.',
      [VencimientoFiltro.POR_VENCER]: 'Ninguna venta vence en los próximos días.',
      [VencimientoFiltro.AL_DIA]: 'No hay ventas al día.',
    }[this.estado];
  }

  private async loadPerfilNombres(ventas: Venta[]): Promise<void> {
    const cuentaIds = Array.from(
      new Set(ventas.filter((v) => v.perfilId).map((v) => v.cuentaId)),
    );
    if (cuentaIds.length === 0) {
      this.perfilNombres.set(new Map());
      return;
    }
    const listas = await Promise.all(
      cuentaIds.map((id) => this.perfilesApi.list(id)),
    );
    const map = new Map<string, string>();
    listas.flat().forEach((p) => map.set(p.id, p.nombre));
    this.perfilNombres.set(map);
  }

  protected servicioNombre(servicioId: string): string {
    return this.servicios().find((s) => s.id === servicioId)?.nombre ?? '—';
  }

  protected clienteNombre(clienteId: string): string {
    return this.clientes().find((c) => c.id === clienteId)?.nombre ?? '—';
  }

  protected cuentaPerfilLabel(venta: Venta): string {
    const cuenta = this.cuentas().find((c) => c.id === venta.cuentaId);
    const correo = cuenta?.correo ?? '—';
    if (!venta.perfilId) {
      return correo;
    }
    const perfilNombre = this.perfilNombres().get(venta.perfilId) ?? '—';
    return `${correo} — ${perfilNombre}`;
  }

  protected diasDiferencia(fechaFin: string): number {
    const hoy = new Date();
    const hoyUTC = Date.UTC(
      hoy.getFullYear(),
      hoy.getMonth(),
      hoy.getDate(),
    );
    const fin = new Date(`${fechaFin}T00:00:00Z`).getTime();
    return Math.round((fin - hoyUTC) / 86_400_000);
  }

  protected diasLabel(dias: number): string {
    if (dias === 0) {
      return 'Vence hoy';
    }
    const n = Math.abs(dias);
    const unidad = n === 1 ? 'día' : 'días';
    return dias < 0 ? `Venció hace ${n} ${unidad}` : `Vence en ${n} ${unidad}`;
  }

  mostrarWhatsapp(): boolean {
    return this.estado !== VencimientoFiltro.AL_DIA;
  }

  // Con la cuenta caída el cliente está sin servicio: no se le cobra ni se
  // le renueva hasta que el proveedor la reponga (ahí se le suman los días).
  // En vez de WhatsApp y Renovar va el chip "Cuenta caída".
  protected puedeCobrar(venta: Venta): boolean {
    return this.mostrarWhatsapp() && !venta.cuentaCaida;
  }

  abrirWhatsapp(venta: Venta): void {
    if (this.estado === VencimientoFiltro.AL_DIA || venta.cuentaCaida) {
      return;
    }
    const cliente = this.clientes().find((c) => c.id === venta.clienteId);
    const servicio = this.servicios().find((s) => s.id === venta.servicioId);
    if (!cliente || !servicio) {
      this.snackBar.open('No se pudo preparar el mensaje de WhatsApp.', 'Cerrar', {
        duration: 4000,
      });
      return;
    }

    const url = whatsappRenewalUrl(cliente.whatsapp, this.estado, {
      cliente: cliente.nombre,
      servicio: servicio.nombre,
      fechaFin: venta.fechaFin,
      dias: this.diasDiferencia(venta.fechaFin),
    });
    window.open(url, '_blank');
  }

  protected comboLabel(venta: Venta): string {
    if (!venta.ventaComboId) {
      return '';
    }
    const codigo = this.comboCodigos().get(venta.ventaComboId);
    return codigo ? `Parte de combo ${codigo}` : 'Parte de combo';
  }

  // El backend bloquea renovar ventas hijas de un combo (se renuevan desde
  // Ventas de Combo): acá se les muestra el badge en vez del botón (ver
  // template).
  openRenew(venta: Venta): void {
    const ref = this.dialog.open(VentaRenewDialog, { data: { venta } });
    ref.afterClosed().subscribe((result?: Venta) => {
      if (result) {
        this.snackBar.open(
          `Venta renovada. Ahora vence el ${formatFechaCorta(result.fechaFin)}.`,
          'Cerrar',
          { duration: 4000 },
        );
        // La venta renovada sale de Vencidas (y puede salir de Por vencer
        // también, según el nuevo diasAlerta): refrescar es lo que la saca
        // de la lista actual.
        void this.refresh();
      }
    });
  }
}
