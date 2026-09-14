import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VentasApi } from '../../sales/ventas-api';
import {
  Moneda,
  VENCIMIENTO_LABELS,
  VencimientoFiltro,
  type Venta,
} from '../../sales/venta.model';
import { whatsappRenewalUrl } from '../../sales/whatsapp.util';
import { ServiciosApi } from '../../services/servicios-api';
import { type Servicio } from '../../services/servicio.model';
import { ContactosApi } from '../../contacts/contactos-api';
import { type Contacto } from '../../contacts/contacto.model';
import { CuentasApi } from '../../accounts/cuentas-api';
import { type CuentaListItem } from '../../accounts/cuenta.model';
import { PerfilesApi } from '../../accounts/profiles/perfiles-api';
import { SolesPipe } from '../../../shared/soles.pipe';

const ESTADOS_VALIDOS = new Set<string>(Object.values(VencimientoFiltro));

@Component({
  imports: [
    FormsModule,
    DatePipe,
    DecimalPipe,
    SolesPipe,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatProgressSpinnerModule,
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
  private readonly snackBar = inject(MatSnackBar);

  protected readonly Moneda = Moneda;
  protected readonly estados = Object.values(VencimientoFiltro);
  protected readonly estadoLabels = VENCIMIENTO_LABELS;
  protected readonly VencimientoFiltro = VencimientoFiltro;

  protected readonly displayedColumns = [
    'cliente',
    'servicio',
    'cuentaPerfil',
    'fechaFin',
    'dias',
    'precio',
    'acciones',
  ];

  readonly ventas = signal<Venta[]>([]);
  readonly servicios = signal<Servicio[]>([]);
  readonly clientes = signal<Contacto[]>([]);
  readonly cuentas = signal<CuentaListItem[]>([]);
  readonly perfilNombres = signal<Map<string, string>>(new Map());
  readonly loading = signal(false);

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
    const [servicios, clientes, cuentas] = await Promise.all([
      this.serviciosApi.list(),
      this.contactosApi.list(),
      this.cuentasApi.list(),
    ]);
    this.servicios.set(servicios);
    this.clientes.set(clientes);
    this.cuentas.set(cuentas);
  }

  async refresh(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this.api.list({
        vencimiento: this.estado,
        diasAlerta: this.diasAlerta,
      });
      this.ventas.set(data);
      await this.loadPerfilNombres(data);
    } catch {
      this.snackBar.open('No se pudieron cargar los vencimientos.', 'Cerrar', {
        duration: 4000,
      });
    } finally {
      this.loading.set(false);
    }
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

  mostrarWhatsapp(): boolean {
    return this.estado !== VencimientoFiltro.AL_DIA;
  }

  abrirWhatsapp(venta: Venta): void {
    if (this.estado === VencimientoFiltro.AL_DIA) {
      return;
    }
    const cliente = this.clientes().find((c) => c.id === venta.clienteId);
    const servicio = this.servicios().find((s) => s.id === venta.servicioId);
    if (!cliente || !servicio) {
      this.snackBar.open('No se pudo armar el mensaje de WhatsApp.', 'Cerrar', {
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
}
