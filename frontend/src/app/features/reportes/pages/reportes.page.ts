import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Asset, Assignment } from '../../../core/models/api.models';
import { AssetsApiService } from '../../../core/services/assets-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, RouterLink],
  template: `
    <section class="shell">
      <div class="between"><h2>Reportes</h2><a class="back-link" routerLink="/menu">← Volver al menú</a></div>

      <div class="card">
        <button type="button" (click)="loadSummary()">Cargar total invertido</button>
        <p *ngIf="totalInvested !== null"><strong>{{ totalInvested | currency : 'USD' }}</strong></p>
      </div>

      <div class="card">
        <form [formGroup]="employeeForm" (ngSubmit)="loadEmployeeReport()" class="grid grid-3">
          <input type="number" formControlName="employeeId" placeholder="Empleado ID" />
          <button type="submit">Reporte por empleado</button>
        </form>
        <ul><li *ngFor="let item of employeeAssignments">{{ item.asset.assetCode }} - {{ item.asset.name }} - {{ item.status }}</li></ul>
      </div>

      <div class="card">
        <button type="button" (click)="loadUpcomingDisposals()">Próximos a baja</button>
        <ul><li *ngFor="let asset of upcoming">{{ asset.assetCode }} - {{ asset.name }}</li></ul>
      </div>

      <div class="card grid grid-3">
        <button type="button" (click)="download('excel')">Exportar Excel</button>
        <button type="button" (click)="download('pdf')">Exportar PDF</button>
      </div>

      <p *ngIf="message">{{ message }}</p>
    </section>
  `
})
export class ReportesPage {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(AssetsApiService);

  totalInvested: number | null = null;
  employeeAssignments: Assignment[] = [];
  upcoming: Asset[] = [];
  message = '';
  readonly employeeForm = this.fb.nonNullable.group({ employeeId: [0, [Validators.required, Validators.min(1)]] });

  loadSummary(): void { this.api.investedSummary().subscribe({ next: (summary) => (this.totalInvested = summary.totalInvested), error: (err) => (this.message = err?.error?.error ?? 'Error') }); }
  loadEmployeeReport(): void { if (this.employeeForm.invalid) return; this.api.employeeReport(this.employeeForm.getRawValue().employeeId).subscribe({ next: (rows) => (this.employeeAssignments = rows), error: (err) => (this.message = err?.error?.error ?? 'Error') }); }
  loadUpcomingDisposals(): void { this.api.upcomingDisposals().subscribe({ next: (rows) => (this.upcoming = rows), error: (err) => (this.message = err?.error?.error ?? 'Error') }); }
  download(format: 'excel' | 'pdf'): void { this.api.exportInvested(format).subscribe({ next: (blob) => { const ext = format === 'pdf' ? 'pdf' : 'csv'; const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `reporte-bienes-invertidos.${ext}`; a.click(); URL.revokeObjectURL(url); }, error: (err) => (this.message = err?.error?.error ?? 'Error') }); }
}
