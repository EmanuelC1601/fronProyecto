import { Component, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { PerfilService } from '../../../core/services/perfil.service';
import { AuthService } from '../../../core/services/auth.service';
import { Perfil } from '../../../shared/models';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, BreadcrumbComponent, PaginationComponent],
  template: `
    <app-breadcrumb [items]="[{label:'Seguridad'},{label:'Perfil'}]" />

    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="fw-bold mb-0"><i class="bi bi-person-badge me-2 text-primary"></i>Perfiles</h5>
      <button *ngIf="permisos().bitAgregar" class="btn btn-primary btn-sm" (click)="openForm()">
        <i class="bi bi-plus-circle me-1"></i> Nuevo Perfil
      </button>
    </div>

    <!-- Tabla -->
    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre del Perfil</th>
                <th>Administrador</th>
                <th>Descripción</th>
                <th *ngIf="permisos().bitEditar || permisos().bitEliminar || permisos().bitDetalle"
                    class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="loading()">
                <td colspan="5" class="text-center py-4">
                  <div class="spinner-border spinner-border-sm text-primary"></div>
                  Cargando...
                </td>
              </tr>
              <tr *ngIf="!loading() && perfiles().length === 0">
                <td colspan="5" class="text-center py-4 text-muted">Sin registros</td>
              </tr>
              <tr *ngFor="let p of perfiles()">
                <td class="text-muted small">{{ p.id }}</td>
                <td class="fw-semibold">{{ p.strNombrePerfil }}</td>
                <td>
                  <span class="badge" [class]="p.bitAdministrador ? 'bg-success' : 'bg-secondary'">
                    {{ p.bitAdministrador ? 'Sí' : 'No' }}
                  </span>
                </td>
                <td class="text-muted small">{{ p.strDescripcion || '—' }}</td>
                <td class="text-center" *ngIf="permisos().bitEditar || permisos().bitEliminar || permisos().bitDetalle">
                  <button *ngIf="permisos().bitDetalle"
                          class="btn btn-sm btn-outline-info me-1"
                          (click)="viewDetail(p)" title="Detalle">
                    <i class="bi bi-eye"></i>
                  </button>
                  <button *ngIf="permisos().bitEditar"
                          class="btn btn-sm btn-outline-warning me-1"
                          (click)="editPerfil(p)" title="Editar">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button *ngIf="permisos().bitEliminar"
                          class="btn btn-sm btn-outline-danger"
                          (click)="deletePerfil(p)" title="Eliminar">
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
      <div class="card shadow-lg" style="width:400px;" (click)="$event.stopPropagation()">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span class="fw-bold"><i class="bi bi-info-circle me-2 text-info"></i>Detalle Perfil</span>
          <button class="btn btn-sm btn-outline-secondary" (click)="detailItem.set(null)">
            <i class="bi bi-x"></i>
          </button>
        </div>
        <div class="card-body">
          <dl class="row mb-0">
            <dt class="col-5 text-muted">ID</dt>
            <dd class="col-7">{{ detailItem()!.id }}</dd>
            <dt class="col-5 text-muted">Nombre</dt>
            <dd class="col-7">{{ detailItem()!.strNombrePerfil }}</dd>
            <dt class="col-5 text-muted">Administrador</dt>
            <dd class="col-7">
              <span class="badge" [class]="detailItem()!.bitAdministrador ? 'bg-success' : 'bg-secondary'">
                {{ detailItem()!.bitAdministrador ? 'Sí' : 'No' }}
              </span>
            </dd>
            <dt class="col-5 text-muted">Descripción</dt>
            <dd class="col-7">{{ detailItem()!.strDescripcion || '—' }}</dd>
          </dl>
        </div>
      </div>
    </div>

    <!-- Modal formulario ACTUALIZADO con descripción -->
    <div *ngIf="showForm()" class="modal-backdrop-custom">
      <div class="card shadow-lg" style="width:480px;">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span class="fw-bold">
            <i class="bi bi-person-badge me-2 text-primary"></i>
            {{ editingId() ? 'Editar Perfil' : 'Nuevo Perfil' }}
          </span>
          <button class="btn btn-sm btn-outline-secondary" (click)="closeForm()">
            <i class="bi bi-x"></i>
          </button>
        </div>
        <div class="card-body">
          <div *ngIf="formError()" class="alert alert-danger py-2 small">{{ formError() }}</div>
          <form [formGroup]="form" (ngSubmit)="saveForm()">
            
            <!-- Nombre del Perfil -->
            <div class="mb-3">
              <label class="form-label fw-semibold">Nombre del Perfil *</label>
              <input type="text" class="form-control"
                     formControlName="strNombrePerfil"
                     placeholder="Nombre del perfil"
                     [class.is-invalid]="isInvalid('strNombrePerfil')" />
              <div class="invalid-feedback">Campo requerido.</div>
            </div>

            <!-- Perfil Administrador con mensaje de ayuda -->
            <div class="mb-3">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="bitAdmin"
                       formControlName="bitAdministrador" />
                <label class="form-check-label fw-semibold" for="bitAdmin">
                  Perfil Administrador
                </label>
              </div>
              <div class="form-text text-muted small mt-1 ms-1">
                <i class="bi bi-info-circle"></i>
                Los perfiles administradores tienen acceso completo al sistema.
              </div>
            </div>

            <!-- Descripción (opcional) -->
            <div class="mb-3">
              <label class="form-label fw-semibold">Descripción</label>
              <textarea class="form-control"
                        rows="3"
                        formControlName="strDescripcion"
                        placeholder="Descripción opcional del perfil"
                        [class.is-invalid]="isInvalid('strDescripcion')"
                        (input)="onDescripcionInput($event)"></textarea>
              <div class="form-text text-muted small">
                Máximo 255 caracteres. {{ descripcionLength() }}/255
              </div>
              <div *ngIf="isInvalid('strDescripcion')" class="invalid-feedback">
                La descripción no puede exceder 255 caracteres.
              </div>
            </div>

            <div class="d-flex gap-2 justify-content-end">
              <button type="button" class="btn btn-secondary btn-sm" (click)="closeForm()">
                Cancelar
              </button>
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
  styles: [`
    .modal-backdrop-custom {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.45);
      display: flex; align-items: center; justify-content: center;
      z-index: 1050;
    }
    textarea {
      resize: vertical;
    }
  `]
})
export class PerfilComponent implements OnInit {
  perfiles     = signal<Perfil[]>([]);
  loading      = signal(true);
  currentPage  = signal(1);
  totalPages   = signal(1);
  total        = signal(0);
  showForm     = signal(false);
  editingId    = signal<number | null>(null);
  saving       = signal(false);
  formError    = signal('');
  detailItem   = signal<Perfil | null>(null);
  descripcionLength = signal(0);
  permisos     = signal({ bitAgregar: false, bitEditar: false, bitEliminar: false,
                          bitConsulta: false, bitDetalle: false });

  form!: FormGroup;

  constructor(
    private perfilService: PerfilService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    const p = this.authService.getPermisoForModulo('perfil');
    if (p) this.permisos.set(p as any);
    this.buildForm();
    this.loadPage(1);
  }

  buildForm() {
    this.form = this.fb.group({
      strNombrePerfil:  ['', Validators.required],
      bitAdministrador: [false],
      strDescripcion:   ['', [Validators.maxLength(255)]]  // Validación de 255 caracteres
    });
  }

  onDescripcionInput(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    this.descripcionLength.set(textarea.value.length);
    
    // Si excede 255, truncar
    if (textarea.value.length > 255) {
      this.form.patchValue({ strDescripcion: textarea.value.slice(0, 255) });
      this.descripcionLength.set(255);
    }
  }

  loadPage(page: number) {
    this.loading.set(true);
    this.perfilService.getAll(page).subscribe({
      next: res => {
        this.perfiles.set(res.data);
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
    this.descripcionLength.set(0);
    this.form.reset({ 
      strNombrePerfil: '', 
      bitAdministrador: false,
      strDescripcion: ''
    });
    this.showForm.set(true);
  }

  editPerfil(p: Perfil) {
    this.editingId.set(p.id!);
    this.formError.set('');
    this.form.patchValue(p);
    this.descripcionLength.set(p.strDescripcion?.length || 0);
    this.showForm.set(true);
  }

  viewDetail(p: Perfil) { this.detailItem.set(p); }

  closeForm() { this.showForm.set(false); }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c.touched);
  }

  saveForm() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.saving.set(true);
    this.formError.set('');

    const data = this.form.value as Perfil;
    const id   = this.editingId();

    const req = id
      ? this.perfilService.update(id, data)
      : this.perfilService.create(data);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.closeForm();
        this.loadPage(this.currentPage());
      },
      error: err => {
        this.saving.set(false);
        this.formError.set(err.error?.message || 'Error al guardar');
      }
    });
  }

  deletePerfil(p: Perfil) {
    if (!confirm(`¿Eliminar el perfil "${p.strNombrePerfil}"?`)) return;
    this.perfilService.delete(p.id!).subscribe({
      next: () => this.loadPage(this.currentPage()),
      error: err => alert(err.error?.message || 'Error al eliminar')
    });
  }
}