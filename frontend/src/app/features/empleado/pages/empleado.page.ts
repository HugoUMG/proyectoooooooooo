import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Assignment } from '../../../core/models/api.models';
import { AssetsApiService } from '../../../core/services/assets-api.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="shell">
      <div class="between"><h2>Portal de Empleado</h2><a class="back-link" routerLink="/menu">← Volver al menú</a></div>

      <div class="card">
        <div class="between"><h3>Mis activos asignados</h3><button type="button" (click)="load()">Actualizar</button></div>
        <ul>
          <li *ngFor="let item of assignments">
            {{ item.asset.assetCode }} - {{ item.asset.name }} - {{ item.status }} - Asignado: {{ item.assignedAt }}
          </li>
        </ul>
        <p *ngIf="!assignments.length" class="muted">No tienes activos asignados por ahora.</p>
      </div>

      <div class="card">
        <h3>Solicitudes / incidencias</h3>
        <p class="muted">Este módulo quedó preparado para que el empleado vea sus activos. Si quieres, en el siguiente paso te implemento el registro formal de incidencias con API y tabla dedicada.</p>
      </div>

      <p *ngIf="message" class="error">{{ message }}</p>
    </section>
  `
})
export class EmpleadoPage implements OnInit {
  private readonly api = inject(AssetsApiService);
  assignments: Assignment[] = [];
  message = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.myAssignments().subscribe({
      next: (rows) => {
        this.assignments = rows;
        this.message = '';
      },
      error: (err) => (this.message = err?.error?.error ?? 'No fue posible cargar tus activos')
    });
  }
}
