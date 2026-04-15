import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AssetsApiService } from '../../../core/services/assets-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="shell">
      <div class="between">
        <h2>Adquisiciones</h2>
        <a class="back-link" routerLink="/menu">← Volver al menú</a>
      </div>

      <div class="card">
        <form [formGroup]="invoiceForm" (ngSubmit)="submit()" class="grid grid-3">
          <input formControlName="invoiceNumber" placeholder="Número de factura" />
          <input type="date" formControlName="invoiceDate" />
          <input type="number" formControlName="totalAmount" placeholder="Total" />
          <input type="number" formControlName="supplierId" placeholder="ID proveedor" />
          <input type="number" formControlName="budgetLineId" placeholder="ID partida" />
          <textarea formControlName="notes" placeholder="Notas"></textarea>
          <button type="submit">Registrar factura</button>
        </form>
        <p *ngIf="message">{{ message }}</p>
      </div>
    </section>
  `
})
export class AdquisicionesPage {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(AssetsApiService);

  message = '';
  readonly invoiceForm = this.fb.nonNullable.group({
    invoiceNumber: ['', Validators.required],
    invoiceDate: ['', Validators.required],
    totalAmount: [0, [Validators.required, Validators.min(0.01)]],
    supplierId: [0, [Validators.required, Validators.min(1)]],
    budgetLineId: [0, [Validators.required, Validators.min(1)]],
    notes: ['']
  });

  submit(): void {
    if (this.invoiceForm.invalid) return;
    this.api.createInvoice(this.invoiceForm.getRawValue()).subscribe({
      next: (invoice) => (this.message = `Factura registrada: ${invoice.invoiceNumber}`),
      error: (err) => (this.message = err?.error?.error ?? 'No fue posible registrar la factura.')
    });
  }
}
