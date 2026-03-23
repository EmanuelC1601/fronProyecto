import { Component, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ModuloService } from '../../../core/services/modulo.service';
import { AuthService } from '../../../core/services/auth.service';
import { Modulo } from '../../../shared/models';

@Component({
  selector: 'app-modulo',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, BreadcrumbComponent, PaginationComponent],
  template: `
    <app-breadcrumb [items]="[{label:'Seguridad'},{label:'Módulo'}]" />

    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="fw-bold mb-0"><i class="bi bi-grid me-2 text-primary"></i>Módulos</h5>
      <button *ngIf="permisos().bitAgregar" class="btn btn-primary btn-sm" (click)="openForm()">
        <i class="bi bi-plus-circle me-1"></i> Nuevo Módulo
      </button>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre del Módulo</th>
                <th *ngIf="permisos().bitEditar || permisos().bitEliminar || permisos().bitDetalle"
                    class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="loading()">
                <td colspan="3" class="text-center py-4">
                  <div class="spinner-border spinner-border-sm text-primary"></div> Cargando...
                </td>
              </tr>
              <tr *ngIf="!loading() && modulos().length === 0">
                <td colspan="3" class="text-center py-4 text-muted">Sin registros</td>
              </tr>
              <tr *ngFor="let m of modulos()">
                <td class="text-muted small">{{ m.id }}</td>
                <td class="fw-semibold">{{ m.strNombreModulo }}</td>
                <td class="text-center" *ngIf="permisos().bitEditar || permisos().bitEliminar || permisos().bitDetalle">
                  <button *ngIf="permisos().bitDetalle"
                          class="btn btn-sm btn-outline-info me-1"
                          (click)="detailItem.set(m)" title="Detalle">
                    <i class="bi bi-eye"></i>
                  </button>
                  <button *ngIf="permisos().bitEditar"
                          class="btn btn-sm btn-outline-warning me-1"
                          (click)="editModulo(m)" title="Editar">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button *ngIf="permisos().bitEliminar"
                          class="btn btn-sm btn-outline-danger"
                          (click)="deleteModulo(m)" title="Eliminar">
                    <i class="bi bi-trash"></i>
                  </button>
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
      <div class="card shadow-lg" style="width:360px;" (click)="$event.stopPropagation()">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span class="fw-bold"><i class="bi bi-info-circle me-2 text-info"></i>Detalle Módulo</span>
          <button class="btn btn-sm btn-outline-secondary" (click)="detailItem.set(null)">
            <i class="bi bi-x"></i>
          </button>
        </div>
        <div class="card-body">
          <dl class="row mb-0">
            <dt class="col-5 text-muted">ID</dt>
            <dd class="col-7">{{ detailItem()!.id }}</dd>
            <dt class="col-5 text-muted">Nombre</dt>
            <dd class="col-7">{{ detailItem()!.strNombreModulo }}</dd>
          </dl>
        </div>
      </div>
    </div>

    <!-- Modal formulario -->
    <div *ngIf="showForm()" class="modal-backdrop-custom">
      <div class="card shadow-lg" style="width:420px;">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span class="fw-bold">
            <i class="bi bi-grid me-2 text-primary"></i>
            {{ editingId() ? 'Editar Módulo' : 'Nuevo Módulo' }}
          </span>
          <button class="btn btn-sm btn-outline-secondary" (click)="closeForm()">
            <i class="bi bi-x"></i>
          </button>
        </div>
        <div class="card-body">
          <div *ngIf="formError()" class="alert alert-danger py-2 small">{{ formError() }}</div>
          <form [formGroup]="form" (ngSubmit)="saveForm()">
            <div class="mb-3">
              <label class="form-label fw-semibold">Nombre del Módulo *</label>
              <input type="text" class="form-control"
                     formControlName="strNombreModulo"
                     placeholder="Ej: perfil"
                     [class.is-invalid]="isInvalid('strNombreModulo')" />
              <div class="invalid-feedback">Campo requerido.</div>
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
export class ModuloComponent implements OnInit {
  modulos     = signal<Modulo[]>([]);
  loading     = signal(true);
  currentPage = signal(1);
  totalPages  = signal(1);
  total       = signal(0);
  showForm    = signal(false);
  editingId   = signal<number | null>(null);
  saving      = signal(false);
  formError   = signal('');
  detailItem  = signal<Modulo | null>(null);
  permisos    = signal({ bitAgregar: false, bitEditar: false, bitEliminar: false,
                         bitConsulta: false, bitDetalle: false });
  form!: FormGroup;

  constructor(
    private moduloService: ModuloService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    const p = this.authService.getPermisoForModulo('modulo');
    if (p) this.permisos.set(p as any);
    this.form = this.fb.group({ strNombreModulo: ['', Validators.required] });
    this.loadPage(1);
  }

  loadPage(page: number) {
    this.loading.set(true);
    this.moduloService.getAll(page).subscribe({
      next: res => {
        this.modulos.set(res.data);
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
    this.form.reset();
    this.showForm.set(true);
  }

  editModulo(m: Modulo) {
    this.editingId.set(m.id!);
    this.formError.set('');
    this.form.patchValue(m);
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
      ? this.moduloService.update(this.editingId()!, this.form.value)
      : this.moduloService.create(this.form.value);

    req.subscribe({
      next: () => { this.saving.set(false); this.closeForm(); this.loadPage(this.currentPage()); },
      error: err => { this.saving.set(false); this.formError.set(err.error?.message || 'Error al guardar'); }
    });
  }

  deleteModulo(m: Modulo) {
    if (!confirm(`¿Eliminar el módulo "${m.strNombreModulo}"?`)) return;
    this.moduloService.delete(m.id!).subscribe({
      next: () => this.loadPage(this.currentPage()),
      error: err => alert(err.error?.message || 'Error al eliminar')
    });
  }
}