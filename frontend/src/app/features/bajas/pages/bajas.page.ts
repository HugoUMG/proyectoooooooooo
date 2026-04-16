import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Disposal } from '../../../core/models/api.models';
import { AssetsApiService } from '../../../core/services/assets-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="shell">
      <div class="between"><h2>Bajas y Enajenación</h2><a class="back-link" routerLink="/menu">← Volver al menú</a></div>

      <div class="card">
        <form [formGroup]="requestForm" (ngSubmit)="requestDisposal()" class="grid grid-3">
          <label>ID activo
            <input type="number" formControlName="assetId" placeholder="Ej. 1" />
          </label>
          <label>Motivo
            <input formControlName="reason" placeholder="Ej. Fin de vida útil" />
          </label>
          <label>Estado inicial de la solicitud
            <select formControlName="disposalType">
              <option value="SOLICITADA">SOLICITADA</option>
              <option value="APROBADA">APROBADA</option>
              <option value="RECHAZADA">RECHAZADA</option>
              <option value="EJECUTADA">EJECUTADA</option>
            </select>
          </label>
          <label>Solicitado por
            <input formControlName="requestedBy" placeholder="Ej. jefe_inventarios" />
          </label>
          <button type="submit">Solicitar baja</button>
        </form>
      </div>

      <div class="card">
        <form [formGroup]="approveForm" (ngSubmit)="approveDisposal()" class="grid grid-3">
          <label>ID baja
            <input type="number" formControlName="id" placeholder="Ej. 1" />
          </label>
          <label>Aprobado por
            <input formControlName="approvedBy" placeholder="Ej. director_finanzas" />
          </label>
          <label>Valor final
            <input type="number" formControlName="finalValue" placeholder="Ej. 1200.00" />
          </label>
          <button type="submit">Aprobar baja</button>
        </form>
      </div>

      <div class="card">
        <div class="between"><h3>Pendientes</h3><button type="button" (click)="loadPending()">Actualizar</button></div>
        <ul><li *ngFor="let disposal of pending">#{{ disposal.id }} - {{ disposal.asset.assetCode }} - {{ disposal.status }}</li></ul>
        <p *ngIf="message">{{ message }}</p>
      </div>
    </section>
  `
})
export class BajasPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(AssetsApiService);
  pending: Disposal[] = [];
  message = '';

  readonly requestForm = this.fb.group({ assetId: [null, [Validators.required, Validators.min(1)]], reason: ['', Validators.required], disposalType: ['SOLICITADA', Validators.required], requestedBy: ['', Validators.required] });
  readonly approveForm = this.fb.group({ id: [null, [Validators.required, Validators.min(1)]], approvedBy: ['', Validators.required], finalValue: [null, [Validators.required, Validators.min(0)]] });

  ngOnInit(): void { this.loadPending(); }
  requestDisposal(): void {
    if (this.requestForm.invalid) return;
    const payload = this.requestForm.getRawValue();
    this.api.requestDisposal({
      assetId: payload.assetId!,
      reason: payload.reason!,
      disposalType: payload.disposalType!,
      requestedBy: payload.requestedBy!
    }).subscribe({ next: () => this.loadPending(), error: (err) => (this.message = err?.error?.error ?? 'Error') });
  }
  approveDisposal(): void {
    if (this.approveForm.invalid) return;
    const { id, approvedBy, finalValue } = this.approveForm.getRawValue();
    this.api.approveDisposal(id!, { approvedBy: approvedBy!, finalValue: finalValue! }).subscribe({ next: () => this.loadPending(), error: (err) => (this.message = err?.error?.error ?? 'Error') });
  }
  loadPending(): void { this.api.listPendingDisposals().subscribe({ next: (rows) => (this.pending = rows), error: (err) => (this.message = err?.error?.error ?? 'Error') }); }
}
