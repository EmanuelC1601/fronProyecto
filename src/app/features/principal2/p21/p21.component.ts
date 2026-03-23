import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-p21',
  standalone: true,
  imports: [NgIf, BreadcrumbComponent],
  template: `
    <app-breadcrumb [items]="[{label:'Principal 2'},{label:'Principal 2.1'}]" />
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="fw-bold mb-0"><i class="bi bi-grid-3x3 me-2 text-primary"></i>Principal 2.1</h5>
      <button *ngIf="p()?.bitAgregar" class="btn btn-primary btn-sm">
        <i class="bi bi-plus-circle me-1"></i> Nuevo
      </button>
    </div>
    <div class="card">
      <div class="card-body p-0">
        <table class="table table-hover align-middle mb-0">
          <thead><tr><th>#</th><th>Campo 1</th><th>Campo 2</th></tr></thead>
          <tbody>
            <tr><td colspan="3" class="text-center py-5 text-muted">
              <i class="bi bi-inbox fs-2 d-block mb-2"></i>Módulo en construcción
            </td></tr>
          </tbody>
        </table>
      </div>
      <div class="card-footer bg-white d-flex gap-2 flex-wrap">
        <button *ngIf="p()?.bitAgregar"  class="btn btn-success btn-sm"><i class="bi bi-plus-circle me-1"></i> Agregar</button>
        <button *ngIf="p()?.bitEditar"   class="btn btn-warning btn-sm"><i class="bi bi-pencil me-1"></i> Editar</button>
        <button *ngIf="p()?.bitConsulta" class="btn btn-info btn-sm"><i class="bi bi-search me-1"></i> Consultar</button>
        <button *ngIf="p()?.bitEliminar" class="btn btn-danger btn-sm"><i class="bi bi-trash me-1"></i> Eliminar</button>
        <button *ngIf="p()?.bitDetalle"  class="btn btn-secondary btn-sm"><i class="bi bi-eye me-1"></i> Detalle</button>
      </div>
    </div>
  `
})
export class P21Component {
  constructor(private authService: AuthService) {}
  p() { return this.authService.getPermisoForModulo('principal2-1'); }
}