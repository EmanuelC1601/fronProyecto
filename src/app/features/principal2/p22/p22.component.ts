import { Component } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-p22',
  standalone: true,
  imports: [NgIf, NgFor, BreadcrumbComponent],
  template: `
    <app-breadcrumb [items]="[{label:'Principal 2'},{label:'Principal 2.2'}]" />

    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="fw-bold mb-0"><i class="bi bi-grid-3x3 me-2 text-primary"></i>Principal 2.2 - Reportes y Estadísticas</h5>
      <button *ngIf="p()?.bitAgregar" class="btn btn-primary btn-sm" (click)="simularAccion('agregar')">
        <i class="bi bi-plus-circle me-1"></i> Nuevo Reporte
      </button>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>ID Reporte</th>
                <th>Título</th>
                <th>Tipo</th>
                <th>Fecha Generación</th>
                <th>Estado</th>
                <th *ngIf="p()?.bitEditar || p()?.bitEliminar || p()?.bitDetalle" class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of datos">
                <td>{{ item.num }}</td>
                <td>{{ item.idReporte }}</td>
                <td class="fw-semibold">{{ item.titulo }}</td>
                <td>{{ item.tipo }}</td>
                <td>{{ item.fecha }}</td>
                <td>
                  <span class="badge" [class]="item.estado === 'Completado' ? 'bg-success' : 'bg-warning'">
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
export class P22Component {
  datos = [
    { num: 1, idReporte: 'RPT-001', titulo: 'Ventas Mensuales Enero', tipo: 'Ventas', fecha: '2025-02-01', estado: 'Completado' },
    { num: 2, idReporte: 'RPT-002', titulo: 'Inventario General', tipo: 'Inventario', fecha: '2025-02-15', estado: 'Completado' },
    { num: 3, idReporte: 'RPT-003', titulo: 'Clientes Nuevos', tipo: 'Clientes', fecha: '2025-03-01', estado: 'Procesando' },
    { num: 4, idReporte: 'RPT-004', titulo: 'Productos Más Vendidos', tipo: 'Ventas', fecha: '2025-03-10', estado: 'Completado' },
    { num: 5, idReporte: 'RPT-005', titulo: 'Rendimiento por Sucursal', tipo: 'Análisis', fecha: '2025-03-20', estado: 'Completado' }
  ];

  constructor(private authService: AuthService) {}

  p() { return this.authService.getPermisoForModulo('principal2-2'); }

  simularAccion(accion: string, item?: any) {
    const nombre = item ? item.titulo : '';
    let mensaje = '';
    
    switch(accion) {
      case 'agregar':
        mensaje = '📝 Función Agregar Reporte - Próximamente disponible';
        break;
      case 'editar':
        mensaje = `✏️ Editar reporte: ${nombre} (Simulación)`;
        break;
      case 'eliminar':
        mensaje = `🗑️ Eliminar reporte: ${nombre} (Simulación)`;
        break;
      case 'consultar':
        mensaje = '🔍 Función Consultar Reportes - Próximamente disponible';
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