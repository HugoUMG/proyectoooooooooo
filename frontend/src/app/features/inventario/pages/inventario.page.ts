import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Asset } from '../../../core/models/api.models';
import { AssetsApiService } from '../../../core/services/assets-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="shell">
      <div class="between">
        <h2>Inventario</h2>
        <a class="back-link" routerLink="/menu">← Volver al menú</a>
      </div>

      <div class="card">
        <form [formGroup]="assetForm" (ngSubmit)="createAsset()" class="grid grid-3">
          <label>Nombre del bien
            <input formControlName="name" placeholder="Ej. Laptop Dell Latitude 5440" />
          </label>
          <label>Número de serie
            <input formControlName="serialNumber" placeholder="Ej. SN-2026-0001" />
          </label>
          <input formControlName="acquisitionDate" type="date" />
          <label>Costo de adquisición
            <input formControlName="acquisitionCost" type="number" placeholder="Ej. 12999.90" />
          </label>
          <label>Tipo de etiqueta
            <select formControlName="tagType"><option value="QR">QR</option><option value="RFID">RFID</option></select>
          </label>
          <label>Valor de etiqueta
            <input formControlName="tagValue" placeholder="Ej. TAG-0001" />
          </label>
          <label>Ubicación
            <input formControlName="location" placeholder="Ej. Almacén central - Estante B3" />
          </label>
          <label>ID de factura
            <input formControlName="purchaseInvoiceId" type="number" placeholder="Ej. 1" />
          </label>
          <label>Descripción
            <input formControlName="description" placeholder="Ej. Equipo asignable para desarrollo" />
          </label>
          <button type="submit">Registrar activo</button>
        </form>
        <small class="muted">Estados permitidos en backend: EN_ALMACEN, ASIGNADO, EN_TRASLADO, EN_REVISION, DADO_DE_BAJA.</small>
        <p *ngIf="message">{{ message }}</p>
      </div>

      <div class="card">
        <div class="between"><h3>Catálogo maestro</h3><button type="button" (click)="loadAssets()">Actualizar</button></div>
        <table *ngIf="assets.length">
          <thead><tr><th>Código</th><th>Nombre</th><th>Estado</th><th>Ubicación</th></tr></thead>
          <tbody><tr *ngFor="let asset of assets"><td>{{ asset.assetCode }}</td><td>{{ asset.name }}</td><td>{{ asset.status }}</td><td>{{ asset.location }}</td></tr></tbody>
        </table>
      </div>
    </section>
  `
})
export class InventarioPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(AssetsApiService);
  assets: Asset[] = [];
  message = '';

  readonly assetForm = this.fb.group({
    assetCode: [''],
    name: ['', Validators.required],
    description: [''],
    serialNumber: ['', Validators.required],
    acquisitionDate: ['', Validators.required],
    acquisitionCost: [null, [Validators.required, Validators.min(0.01)]],
    tagType: this.fb.nonNullable.control<'QR' | 'RFID'>('QR', Validators.required),
    tagValue: ['', Validators.required],
    location: ['', Validators.required],
    purchaseInvoiceId: [null, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void { this.loadAssets(); }
  createAsset(): void {
    if (this.assetForm.invalid) return;
    const payload = this.assetForm.getRawValue();
    this.api.createAsset({
      assetCode: payload.assetCode ?? undefined,
      name: payload.name!,
      description: payload.description ?? undefined,
      serialNumber: payload.serialNumber!,
      acquisitionDate: payload.acquisitionDate!,
      acquisitionCost: payload.acquisitionCost!,
      tagType: payload.tagType!,
      tagValue: payload.tagValue!,
      location: payload.location!,
      purchaseInvoiceId: payload.purchaseInvoiceId!
    }).subscribe({ next: () => this.loadAssets(), error: (err) => (this.message = err?.error?.error ?? 'Error') });
  }
  loadAssets(): void {
    this.api.listAssets().subscribe({ next: (assets) => (this.assets = assets), error: () => (this.message = 'No se pudo cargar inventario') });
  }
}
