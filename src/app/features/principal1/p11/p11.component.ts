import { Component } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-p11',
  standalone: true,
  imports: [NgIf, NgFor, BreadcrumbComponent],
  template: `
    <app-breadcrumb [items]="[{label:'Principal 1'},{label:'Principal 1.1'}]" />

    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="fw-bold mb-0"><i class="bi bi-grid-1x2 me-2 text-primary"></i>Principal 1.1 - Gestión de Elementos</h5>
      <button *ngIf="p()?.bitAgregar" class="btn btn-primary btn-sm" (click)="simularAccion('agregar')">
        <i class="bi bi-plus-circle me-1"></i> Nuevo
      </button>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th *ngIf="p()?.bitEditar || p()?.bitEliminar || p()?.bitDetalle" class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of datos">
                <td>{{ item.num }}</td>
                <td>{{ item.id }}</td>
                <td class="fw-semibold">{{ item.nombre }}</td>
                <td>{{ item.descripcion }}</td>
                <td>{{ item.fecha }}</td>
                <td>
                  <span class="badge" [class]="item.estado === 'Activo' ? 'bg-success' : 'bg-danger'">
                    {{ item.estado }}
                  </span>
                </td>
                <td class="text-center" *ngIf="p()?.bitEditar || p()?.bitEliminar || p()?.bitDetalle">
                  <button *ngIf="p()?.bitDetalle" class="btn btn-sm btn-outline-info me-1" (click)="simularAccion('detalle', item)" title="Detalle">
                    <i class="bi bi-eye"></i>
                  </button>
                  <button *ngIf="p()?.bitEditar" class="btn btn-sm btn-outline-warning me-1" (click)="simularAccion('editar', item)" title="Editar">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button *ngIf="p()?.bitEliminar" class="btn btn-sm btn-outline-danger" (click)="simularAccion('eliminar', item)" title="Eliminar">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="card-footer bg-white d-flex gap-2 flex-wrap">
        <button *ngIf="p()?.bitAgregar" class="btn btn-success btn-sm" (click)="simularAccion('agregar')">
          <i class="bi bi-plus-circle me-1"></i> Agregar
        </button>
        <button *ngIf="p()?.bitConsulta" class="btn btn-info btn-sm" (click)="simularAccion('consultar')">
          <i class="bi bi-search me-1"></i> Consultar
        </button>
      </div>
    </div>
  `
})
export class P11Component {
  datos = [
    { num: 1, id: 1, nombre: 'Elemento Alpha', descripcion: 'Descripción del elemento alpha con datos de ejemplo', fecha: '2025-01-15', estado: 'Activo' },
    { num: 2, id: 2, nombre: 'Elemento Beta', descripcion: 'Descripción del elemento beta con datos de ejemplo', fecha: '2025-02-20', estado: 'Activo' },
    { num: 3, id: 3, nombre: 'Elemento Gamma', descripcion: 'Descripción del elemento gamma con datos de ejemplo', fecha: '2025-03-10', estado: 'Inactivo' },
    { num: 4, id: 4, nombre: 'Elemento Delta', descripcion: 'Descripción del elemento delta con datos de ejemplo', fecha: '2025-04-05', estado: 'Activo' },
    { num: 5, id: 5, nombre: 'Elemento Epsilon', descripcion: 'Descripción del elemento epsilon con datos de ejemplo', fecha: '2025-05-18', estado: 'Activo' }
  ];

  constructor(private authService: AuthService) {}

  p() { return this.authService.getPermisoForModulo('principal1-1'); }

  simularAccion(accion: string, item?: any) {
    const nombre = item ? item.nombre : '';
    let mensaje = '';
    
    switch(accion) {
      case 'agregar':
        mensaje = '📝 Función Agregar - Próximamente disponible';
        break;
      case 'editar':
        mensaje = `✏️ Editar elemento: ${nombre} (Simulación)`;
        break;
      case 'eliminar':
        mensaje = `🗑️ Eliminar elemento: ${nombre} (Simulación)`;
        break;
      case 'consultar':
        mensaje = '🔍 Función Consultar - Próximamente disponible';
        break;
      case 'detalle':
        mensaje = `ℹ️ Ver detalle de: ${nombre}`;
        break;
      default:
        mensaje = `Acción: ${accion}`;
    }
    
    alert(mensaje);
  }
}