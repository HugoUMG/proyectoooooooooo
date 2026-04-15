import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AssetsApiService } from '../../../core/services/assets-api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="shell">
      <div class="card">
        <div class="between">
          <div>
            <h1>Interfaz General (Menú)</h1>
            <p class="muted">Sesión activa: <strong>{{ auth.username() }}</strong></p>
          </div>
          <button type="button" (click)="logout()">Cerrar sesión</button>
        </div>

        <p>Abre cada módulo en una pestaña nueva:</p>
        <div class="grid grid-3">
          <button type="button" (click)="openTab('/adquisiciones')">Adquisiciones</button>
          <button type="button" (click)="openTab('/inventario')">Inventario</button>
          <button type="button" (click)="openTab('/asignaciones')">Asignaciones</button>
          <button type="button" (click)="openTab('/bajas')">Bajas</button>
          <button type="button" (click)="openTab('/reportes')">Reportes</button>
        </div>
      </div>

      <div class="card" *ngIf="auth.isAdmin()">
        <h2>Alta de usuario (solo admin)</h2>
        <p class="muted">Este registro crea usuarios en el backend para autenticación HTTP Basic.</p>

        <form [formGroup]="userForm" (ngSubmit)="createUser()" class="grid grid-3">
          <input formControlName="username" placeholder="nuevo usuario" />
          <input formControlName="password" placeholder="contraseña" type="password" />
          <select formControlName="role">
            <option value="ADMINISTRADOR">ADMINISTRADOR</option>
            <option value="COMPRAS">COMPRAS</option>
            <option value="INVENTARIO">INVENTARIO</option>
            <option value="EMPLEADO">EMPLEADO</option>
            <option value="FINANZAS">FINANZAS</option>
          </select>
          <button type="submit">Crear usuario</button>
        </form>

        <p *ngIf="message">{{ message }}</p>
      </div>
    </section>
  `
})
export class MenuPage {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly api = inject(AssetsApiService);
  readonly auth = inject(AuthService);

  message = '';
  readonly userForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    role: this.fb.nonNullable.control<'ADMINISTRADOR' | 'COMPRAS' | 'INVENTARIO' | 'EMPLEADO' | 'FINANZAS'>(
      'EMPLEADO',
      Validators.required
    )
  });

  openTab(path: string): void {
    window.open(path, '_blank');
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  createUser(): void {
    if (this.userForm.invalid) return;
    this.api.createUser(this.userForm.getRawValue()).subscribe({
      next: (user) => (this.message = `Usuario creado: ${user.username} (${user.role})`),
      error: (err) => (this.message = err?.error?.error ?? 'No fue posible crear el usuario.')
    });
  }
}
