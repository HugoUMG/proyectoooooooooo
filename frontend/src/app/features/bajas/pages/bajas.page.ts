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
          <input type="number" formControlName="assetId" placeholder="ID activo" />
          <input formControlName="reason" placeholder="Motivo" />
          <input formControlName="disposalType" placeholder="Tipo" />
          <input formControlName="requestedBy" placeholder="Solicitado por" />
          <button type="submit">Solicitar baja</button>
        </form>
      </div>

      <div class="card">
        <form [formGroup]="approveForm" (ngSubmit)="approveDisposal()" class="grid grid-3">
          <input type="number" formControlName="id" placeholder="ID baja" />
          <input formControlName="approvedBy" placeholder="Aprobado por" />
          <input type="number" formControlName="finalValue" placeholder="Valor final" />
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

  readonly requestForm = this.fb.nonNullable.group({ assetId: [0, [Validators.required, Validators.min(1)]], reason: ['', Validators.required], disposalType: ['', Validators.required], requestedBy: ['', Validators.required] });
  readonly approveForm = this.fb.nonNullable.group({ id: [0, [Validators.required, Validators.min(1)]], approvedBy: ['', Validators.required], finalValue: [0, [Validators.required, Validators.min(0)]] });

  ngOnInit(): void { this.loadPending(); }
  requestDisposal(): void { if (this.requestForm.invalid) return; this.api.requestDisposal(this.requestForm.getRawValue()).subscribe({ next: () => this.loadPending(), error: (err) => (this.message = err?.error?.error ?? 'Error') }); }
  approveDisposal(): void { if (this.approveForm.invalid) return; const { id, approvedBy, finalValue } = this.approveForm.getRawValue(); this.api.approveDisposal(id, { approvedBy, finalValue }).subscribe({ next: () => this.loadPending(), error: (err) => (this.message = err?.error?.error ?? 'Error') }); }
  loadPending(): void { this.api.listPendingDisposals().subscribe({ next: (rows) => (this.pending = rows), error: (err) => (this.message = err?.error?.error ?? 'Error') }); }
}
