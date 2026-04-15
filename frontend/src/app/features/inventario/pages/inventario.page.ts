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
          <input formControlName="name" placeholder="Nombre del bien" />
          <input formControlName="serialNumber" placeholder="Serie" />
          <input formControlName="acquisitionDate" type="date" />
          <input formControlName="acquisitionCost" type="number" placeholder="Costo" />
          <select formControlName="tagType"><option value="QR">QR</option><option value="RFID">RFID</option></select>
          <input formControlName="tagValue" placeholder="Etiqueta" />
          <input formControlName="location" placeholder="Ubicación" />
          <input formControlName="purchaseInvoiceId" type="number" placeholder="Factura ID" />
          <input formControlName="description" placeholder="Descripción" />
          <button type="submit">Registrar activo</button>
        </form>
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

  readonly assetForm = this.fb.nonNullable.group({
    assetCode: [''],
    name: ['', Validators.required],
    description: [''],
    serialNumber: ['', Validators.required],
    acquisitionDate: ['', Validators.required],
    acquisitionCost: [0, [Validators.required, Validators.min(0.01)]],
    tagType: this.fb.nonNullable.control<'QR' | 'RFID'>('QR', Validators.required),
    tagValue: ['', Validators.required],
    location: ['', Validators.required],
    purchaseInvoiceId: [0, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void { this.loadAssets(); }
  createAsset(): void {
    if (this.assetForm.invalid) return;
    this.api.createAsset(this.assetForm.getRawValue()).subscribe({ next: () => this.loadAssets(), error: (err) => (this.message = err?.error?.error ?? 'Error') });
  }
  loadAssets(): void {
    this.api.listAssets().subscribe({ next: (assets) => (this.assets = assets), error: () => (this.message = 'No se pudo cargar inventario') });
  }
}
