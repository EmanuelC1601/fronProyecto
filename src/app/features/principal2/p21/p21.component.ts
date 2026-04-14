import { Component } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-p21',
  standalone: true,
  imports: [NgIf, NgFor, BreadcrumbComponent],
  template: `
    <app-breadcrumb [items]="[{label:'Principal 2'},{label:'Principal 2.1'}]" />

    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="fw-bold mb-0"><i class="bi bi-grid-3x3 me-2 text-primary"></i>Principal 2.1 - Gestión de Clientes</h5>
      <button *ngIf="p()?.bitAgregar" class="btn btn-primary btn-sm" (click)="simularAccion('agregar')">
        <i class="bi bi-plus-circle me-1"></i> Nuevo Cliente
      </button>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>ID Cliente</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Ciudad</th>
                <th *ngIf="p()?.bitEditar || p()?.bitEliminar || p()?.bitDetalle" class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of datos">
                <td>{{ item.num }}</td>
                <td>{{ item.idCliente }}</td>
                <td class="fw-semibold">{{ item.nombre }}</td>
                <td>{{ item.email }}</td>
                <td>{{ item.telefono }}</td>
                <td>{{ item.ciudad }}</td>
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
export class P21Component {
  datos = [
    { num: 1, idCliente: 'CLI-001', nombre: 'María González', email: 'maria@example.com', telefono: '555-0101', ciudad: 'Ciudad de México' },
    { num: 2, idCliente: 'CLI-002', nombre: 'Juan Pérez', email: 'juan@example.com', telefono: '555-0102', ciudad: 'Guadalajara' },
    { num: 3, idCliente: 'CLI-003', nombre: 'Ana Rodríguez', email: 'ana@example.com', telefono: '555-0103', ciudad: 'Monterrey' },
    { num: 4, idCliente: 'CLI-004', nombre: 'Carlos López', email: 'carlos@example.com', telefono: '555-0104', ciudad: 'Puebla' },
    { num: 5, idCliente: 'CLI-005', nombre: 'Laura Martínez', email: 'laura@example.com', telefono: '555-0105', ciudad: 'Querétaro' }
  ];

  constructor(private authService: AuthService) {}

  p() { return this.authService.getPermisoForModulo('principal2-1'); }

  simularAccion(accion: string, item?: any) {
    const nombre = item ? item.nombre : '';
    let mensaje = '';
    
    switch(accion) {
      case 'agregar':
        mensaje = '📝 Función Agregar Cliente - Próximamente disponible';
        break;
      case 'editar':
        mensaje = `✏️ Editar cliente: ${nombre} (Simulación)`;
        break;
      case 'eliminar':
        mensaje = `🗑️ Eliminar cliente: ${nombre} (Simulación)`;
        break;
      case 'consultar':
        mensaje = '🔍 Función Consultar Clientes - Próximamente disponible';
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