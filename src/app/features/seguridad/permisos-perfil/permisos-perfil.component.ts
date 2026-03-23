import { Component, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { PermisosPerfilService } from '../../../core/services/permisos-perfil.service';
import { PerfilService } from '../../../core/services/perfil.service';
import { ModuloService } from '../../../core/services/modulo.service';
import { AuthService } from '../../../core/services/auth.service';
import { PermisosPerfil, Perfil, Modulo } from '../../../shared/models';

@Component({
  selector: 'app-permisos-perfil',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, BreadcrumbComponent, PaginationComponent],
  template: `
    <app-breadcrumb [items]="[{label:'Seguridad'},{label:'Permisos Perfil'}]" />

    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="fw-bold mb-0"><i class="bi bi-key me-2 text-primary"></i>Permisos por Perfil</h5>
      <button *ngIf="permisos().bitAgregar" class="btn btn-primary btn-sm" (click)="openForm()">
        <i class="bi bi-plus-circle me-1"></i> Nuevo Permiso
      </button>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0 small">
            <thead>
              <tr>
                <th>Perfil</th>
                <th>Módulo</th>
                <th class="text-center">Agregar</th>
                <th class="text-center">Editar</th>
                <th class="text-center">Consulta</th>
                <th class="text-center">Eliminar</th>
                <th class="text-center">Detalle</th>
                <th *ngIf="permisos().bitEditar || permisos().bitEliminar || permisos().bitDetalle"
                    class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="loading()">
                <td colspan="8" class="text-center py-4">
                  <div class="spinner-border spinner-border-sm text-primary"></div> Cargando...
                </td>
              </tr>
              <tr *ngIf="!loading() && registros().length === 0">
                <td colspan="8" class="text-center py-4 text-muted">Sin registros</td>
              </tr>
              <tr *ngFor="let r of registros()">
                <td>{{ r.strNombrePerfil }}</td>
                <td>{{ r.strNombreModulo }}</td>
                <td class="text-center"><i class="bi" [class]="r.bitAgregar ? 'bi-check-circle-fill text-success' : 'bi-x-circle text-muted'"></i></td>
                <td class="text-center"><i class="bi" [class]="r.bitEditar ? 'bi-check-circle-fill text-success' : 'bi-x-circle text-muted'"></i></td>
                <td class="text-center"><i class="bi" [class]="r.bitConsulta ? 'bi-check-circle-fill text-success' : 'bi-x-circle text-muted'"></i></td>
                <td class="text-center"><i class="bi" [class]="r.bitEliminar ? 'bi-check-circle-fill text-success' : 'bi-x-circle text-muted'"></i></td>
                <td class="text-center"><i class="bi" [class]="r.bitDetalle ? 'bi-check-circle-fill text-success' : 'bi-x-circle text-muted'"></i></td>
                <td class="text-center" *ngIf="permisos().bitEditar || permisos().bitEliminar || permisos().bitDetalle">
                  <button *ngIf="permisos().bitDetalle"
                          class="btn btn-sm btn-outline-info me-1"
                          (click)="detailItem.set(r)"><i class="bi bi-eye"></i></button>
                  <button *ngIf="permisos().bitEditar"
                          class="btn btn-sm btn-outline-warning me-1"
                          (click)="editRegistro(r)"><i class="bi bi-pencil"></i></button>
                  <button *ngIf="permisos().bitEliminar"
                          class="btn btn-sm btn-outline-danger"
                          (click)="deleteRegistro(r)"><i class="bi bi-trash"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="card-footer d-flex align-items-center bg-white">
        <app-pagination
          [currentPage]="currentPage()"
          [pages]="totalPages()"
          [total]="total()"
          (pageChange)="loadPage($event)" />
      </div>
    </div>

    <!-- Modal detalle -->
    <div *ngIf="detailItem()" class="modal-backdrop-custom" (click)="detailItem.set(null)">
      <div class="card shadow-lg" style="width:380px;" (click)="$event.stopPropagation()">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span class="fw-bold"><i class="bi bi-info-circle me-2 text-info"></i>Detalle Permiso</span>
          <button class="btn btn-sm btn-outline-secondary" (click)="detailItem.set(null)"><i class="bi bi-x"></i></button>
        </div>
        <div class="card-body small">
          <dl class="row mb-0">
            <dt class="col-5 text-muted">Perfil</dt><dd class="col-7">{{ detailItem()!.strNombrePerfil }}</dd>
            <dt class="col-5 text-muted">Módulo</dt><dd class="col-7">{{ detailItem()!.strNombreModulo }}</dd>
            <dt class="col-5 text-muted">Agregar</dt><dd class="col-7">{{ detailItem()!.bitAgregar ? 'Sí' : 'No' }}</dd>
            <dt class="col-5 text-muted">Editar</dt><dd class="col-7">{{ detailItem()!.bitEditar ? 'Sí' : 'No' }}</dd>
            <dt class="col-5 text-muted">Consulta</dt><dd class="col-7">{{ detailItem()!.bitConsulta ? 'Sí' : 'No' }}</dd>
            <dt class="col-5 text-muted">Eliminar</dt><dd class="col-7">{{ detailItem()!.bitEliminar ? 'Sí' : 'No' }}</dd>
            <dt class="col-5 text-muted">Detalle</dt><dd class="col-7">{{ detailItem()!.bitDetalle ? 'Sí' : 'No' }}</dd>
          </dl>
        </div>
      </div>
    </div>

    <!-- Modal formulario -->
    <div *ngIf="showForm()" class="modal-backdrop-custom">
      <div class="card shadow-lg" style="width:480px;">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span class="fw-bold">
            <i class="bi bi-key me-2 text-primary"></i>
            {{ editingId() ? 'Editar Permiso' : 'Nuevo Permiso' }}
          </span>
          <button class="btn btn-sm btn-outline-secondary" (click)="closeForm()"><i class="bi bi-x"></i></button>
        </div>
        <div class="card-body">
          <div *ngIf="formError()" class="alert alert-danger py-2 small">{{ formError() }}</div>
          <form [formGroup]="form" (ngSubmit)="saveForm()">
            <div class="row g-3 mb-3">
              <div class="col-6">
                <label class="form-label fw-semibold">Perfil *</label>
                <select class="form-select" formControlName="idPerfil"
                        [class.is-invalid]="isInvalid('idPerfil')">
                  <option value="">Seleccionar...</option>
                  <option *ngFor="let p of perfilesList()" [value]="p.id">{{ p.strNombrePerfil }}</option>
                </select>
                <div class="invalid-feedback">Requerido.</div>
              </div>
              <div class="col-6">
                <label class="form-label fw-semibold">Módulo *</label>
                <select class="form-select" formControlName="idModulo"
                        [class.is-invalid]="isInvalid('idModulo')">
                  <option value="">Seleccionar...</option>
                  <option *ngFor="let m of modulosList()" [value]="m.id">{{ m.strNombreModulo }}</option>
                </select>
                <div class="invalid-feedback">Requerido.</div>
              </div>
            </div>

            <p class="fw-semibold small mb-2">Permisos:</p>
            <div class="row g-2 mb-3">
              <div class="col-4" *ngFor="let bit of bitsConfig">
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox"
                         [id]="bit.key" [formControlName]="bit.key" />
                  <label class="form-check-label small" [for]="bit.key">{{ bit.label }}</label>
                </div>
              </div>
            </div>

            <div class="d-flex gap-2 justify-content-end">
              <button type="button" class="btn btn-secondary btn-sm" (click)="closeForm()">Cancelar</button>
              <button type="submit" class="btn btn-primary btn-sm" [disabled]="saving()">
                <span *ngIf="saving()" class="spinner-border spinner-border-sm me-1"></span>
                {{ editingId() ? 'Actualizar' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`.modal-backdrop-custom{position:fixed;inset:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;z-index:1050;}`]
})
export class PermisosPerfilComponent implements OnInit {
  registros    = signal<PermisosPerfil[]>([]);
  perfilesList = signal<Perfil[]>([]);
  modulosList  = signal<Modulo[]>([]);
  loading      = signal(true);
  currentPage  = signal(1);
  totalPages   = signal(1);
  total        = signal(0);
  showForm     = signal(false);
  editingId    = signal<number | null>(null);
  saving       = signal(false);
  formError    = signal('');
  detailItem   = signal<PermisosPerfil | null>(null);
  permisos     = signal({ bitAgregar: false, bitEditar: false, bitEliminar: false,
                          bitConsulta: false, bitDetalle: false });

  bitsConfig = [
    { key: 'bitAgregar',  label: 'Agregar'  },
    { key: 'bitEditar',   label: 'Editar'   },
    { key: 'bitConsulta', label: 'Consulta' },
    { key: 'bitEliminar', label: 'Eliminar' },
    { key: 'bitDetalle',  label: 'Detalle'  }
  ];

  form!: FormGroup;

  constructor(
    private ppService: PermisosPerfilService,
    private perfilService: PerfilService,
    private moduloService: ModuloService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    const p = this.authService.getPermisoForModulo('permisos-perfil');
    if (p) this.permisos.set(p as any);

    this.form = this.fb.group({
      idPerfil:    ['', [Validators.required, Validators.min(1)]],
      idModulo:    ['', [Validators.required, Validators.min(1)]],
      bitAgregar:  [false],
      bitEditar:   [false],
      bitConsulta: [false],
      bitEliminar: [false],
      bitDetalle:  [false]
    });

    this.loadPage(1);
    this.loadCatalogs();
  }

  loadCatalogs() {
    this.perfilService.getAll(1).subscribe(r => this.perfilesList.set(r.data));
    this.moduloService.getAll(1).subscribe(r => this.modulosList.set(r.data));
  }

  loadPage(page: number) {
    this.loading.set(true);
    this.ppService.getAll(page).subscribe({
      next: res => {
        this.registros.set(res.data);
        this.currentPage.set(res.page);
        this.totalPages.set(res.pages);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openForm() {
    this.editingId.set(null);
    this.formError.set('');
    this.form.reset({ idPerfil: '', idModulo: '', bitAgregar: false, bitEditar: false,
                      bitConsulta: false, bitEliminar: false, bitDetalle: false });
    this.showForm.set(true);
  }

  editRegistro(r: PermisosPerfil) {
    this.editingId.set(r.id!);
    this.formError.set('');
    this.form.patchValue(r);
    this.showForm.set(true);
  }

  closeForm() { this.showForm.set(false); }

  isInvalid(f: string) {
    const c = this.form.get(f);
    return !!(c?.invalid && c.touched);
  }

  saveForm() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.saving.set(true);

    const req = this.editingId()
      ? this.ppService.update(this.editingId()!, this.form.value)
      : this.ppService.create(this.form.value);

    req.subscribe({
      next: () => { this.saving.set(false); this.closeForm(); this.loadPage(this.currentPage()); },
      error: err => { this.saving.set(false); this.formError.set(err.error?.message || 'Error al guardar'); }
    });
  }

  deleteRegistro(r: PermisosPerfil) {
    if (!confirm(`¿Eliminar el permiso de "${r.strNombrePerfil}" para "${r.strNombreModulo}"?`)) return;
    this.ppService.delete(r.id!).subscribe({
      next: () => this.loadPage(this.currentPage()),
      error: err => alert(err.error?.message || 'Error al eliminar')
    });
  }
}