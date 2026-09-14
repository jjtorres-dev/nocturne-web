import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ContactosApi } from '../contactos-api';
import {
  CONTACT_TYPE_LABELS,
  ContactType,
  type Contacto,
} from '../contacto.model';

export interface ContactoFormDialogData {
  contacto?: Contacto;
}

@Component({
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  selector: 'app-contacto-form-dialog',
  styleUrl: './contacto-form-dialog.scss',
  templateUrl: './contacto-form-dialog.html',
})
export class ContactoFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ContactosApi);
  private readonly dialogRef = inject(
    MatDialogRef<ContactoFormDialog, Contacto | undefined>,
  );
  protected readonly data = inject<ContactoFormDialogData>(MAT_DIALOG_DATA);

  protected readonly contactTypes = Object.values(ContactType);
  protected readonly typeLabels = CONTACT_TYPE_LABELS;
  protected readonly isEdit = !!this.data.contacto;

  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    nombre: [this.data.contacto?.nombre ?? '', [Validators.required, Validators.minLength(1)]],
    whatsapp: [this.data.contacto?.whatsapp ?? '', [Validators.required, Validators.minLength(1)]],
    tipo: [this.data.contacto?.tipo ?? ContactType.CLIENTE_FINAL, Validators.required],
  });

  async submit(): Promise<void> {
    if (this.form.invalid || this.saving()) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const payload = this.form.getRawValue();

    try {
      const result = this.isEdit
        ? await this.api.update(this.data.contacto!.id, payload)
        : await this.api.create(payload);
      this.dialogRef.close(result);
    } catch {
      this.errorMessage.set('No se pudo guardar el contacto. Intenta de nuevo.');
    } finally {
      this.saving.set(false);
    }
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
