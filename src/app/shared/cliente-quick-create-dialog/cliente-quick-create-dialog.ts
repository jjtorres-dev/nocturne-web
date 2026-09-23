import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ContactosApi } from '../../features/contacts/contactos-api';
import { ContactType, type Contacto } from '../../features/contacts/contacto.model';
import { extractErrorMessage, injectFormError } from '../form-error';

// Modal chico para crear un cliente sin salir del formulario de venta que
// lo abrió (Ventas / Ventas Combo): solo nombre y WhatsApp, tipo fijo en
// CLIENTE_FINAL — para el tipo completo (con Proveedor/Revendedor) está el
// formulario de Contactos.
@Component({
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  selector: 'app-cliente-quick-create-dialog',
  styleUrl: './cliente-quick-create-dialog.scss',
  templateUrl: './cliente-quick-create-dialog.html',
})
export class ClienteQuickCreateDialog {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ContactosApi);
  private readonly dialogRef = inject(
    MatDialogRef<ClienteQuickCreateDialog, Contacto | undefined>,
  );

  readonly saving = signal(false);
  private readonly formError = injectFormError();
  readonly errorMessage = this.formError.message;

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(1)]],
    whatsapp: ['', [Validators.required, Validators.minLength(1)]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.formError.clear();

    try {
      const result = await this.api.create({
        ...this.form.getRawValue(),
        tipo: ContactType.CLIENTE_FINAL,
      });
      this.dialogRef.close(result);
    } catch (error) {
      this.formError.show(
        extractErrorMessage(error, 'No se pudo crear el cliente. Inténtalo de nuevo.'),
      );
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
