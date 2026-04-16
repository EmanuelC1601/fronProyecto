import { Component, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { PerfilService } from '../../../core/services/perfil.service';
import { AuthService } from '../../../core/services/auth.service';
import { Perfil } from '../../../shared/models';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, ReactiveFormsModule, BreadcrumbComponent, PaginationComponent],
  template: `
    <app-breadcrumb [items]="[{label:'Seguridad'},{label:'Perfil'}]" />

    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="fw-bold mb-0"><i class="bi bi-person-badge me-2 text-primary"></i>Perfiles</h5>
      <button *ngIf="permisos().bitAgregar" class="btn btn-primary btn-sm" (click)="openForm()">
        <i class="bi bi-plus-circle me-1"></i> Nuevo Perfil
      </button>
    </div>

    <!-- 🔍 BARRA DE BÚSQUEDA Y FILTROS -->
    <div class="card mb-3">
      <div class="card-body py-2">
        <div class="row g-2 align-items-center">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text bg-white">
                <i class="bi bi-search"></i>
              </span>
              <input type="text" 
                     class="form-control" 
                     placeholder="Buscar por nombre del perfil o descripción..."
                     [(ngModel)]="terminoBusqueda"
                     (ngModelChange)="aplicarFiltros()">
              <button *ngIf="terminoBusqueda" 
                      class="btn btn-outline-secondary" 
                      type="button" 
                      (click)="limpiarBusqueda()">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select" [(ngModel)]="filtroAdmin" (ngModelChange)="aplicarFiltros()">
              <option value="">Todos los perfiles</option>
              <option value="admin">Solo Administradores</option>
              <option value="no-admin">No Administradores</option>
            </select>
          </div>
          <div class="col-md-3 text-md-end">
            <span class="text-muted small">
              <i class="bi bi-info-circle"></i>
              {{ perfilesFiltrados().length }} de {{ total() }} perfiles
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabla (sin columna de ID) -->
    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Nombre del Perfil</th>
                <th>Administrador</th>
                <th>Descripción</th>
                <th *ngIf="permisos().bitEditar || permisos().bitEliminar || permisos().bitDetalle"
                    class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="loading()">
                <td colspan="4" class="text-center py-4">
                  <div class="spinner-border spinner-border-sm text-primary"></div>
                  Cargando...
                </td>
               </tr>
              <tr *ngIf="!loading() && perfilesFiltrados().length === 0">
                <td colspan="4" class="text-center py-4 text-muted">
                  <i class="bi bi-inbox fs-2 d-block mb-2"></i>
                  No se encontraron perfiles
                </td>
               </tr>
              <tr *ngFor="let p of perfilesFiltrados()">
                <td class="fw-semibold">
                  <i class="bi bi-person-badge me-2 text-primary"></i>
                  {{ p.strNombrePerfil }}
                </td>
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

    <!-- Modal detalle (el ID se muestra AQUÍ) -->
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

    <!-- Modal formulario con validaciones -->
    <div *ngIf="showForm()" class="modal-backdrop-custom">
      <div class="card shadow-lg" style="width:500px;">
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
                     placeholder="Ej: Administrador, Usuario, Invitado"
                     [class.is-invalid]="isInvalid('strNombrePerfil')" />
              <div class="invalid-feedback">
                <span *ngIf="form.get('strNombrePerfil')?.hasError('required')">El nombre del perfil es requerido</span>
                <span *ngIf="form.get('strNombrePerfil')?.hasError('minlength')">Mínimo 3 caracteres</span>
                <span *ngIf="form.get('strNombrePerfil')?.hasError('maxlength')">Máximo 50 caracteres</span>
                <span *ngIf="form.get('strNombrePerfil')?.hasError('pattern')">Solo letras, números, espacios y guiones</span>
                <span *ngIf="form.get('strNombrePerfil')?.hasError('noWhitespace')">No puede contener solo espacios</span>
              </div>
            </div>

            <!-- Perfil Administrador -->
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
                        placeholder="Descripción opcional del perfil (máximo 255 caracteres)"
                        [class.is-invalid]="isInvalid('strDescripcion')"
                        (input)="onDescripcionInput($event)"></textarea>
              <div class="form-text text-muted small d-flex justify-content-between">
                <span><i class="bi bi-info-circle"></i> Descripción opcional</span>
                <span [class.text-danger]="descripcionLength() > 255">{{ descripcionLength() }}/255</span>
              </div>
              <div *ngIf="isInvalid('strDescripcion')" class="invalid-feedback">
                <span *ngIf="form.get('strDescripcion')?.hasError('maxlength')">La descripción no puede exceder 255 caracteres</span>
              </div>
            </div>

            <div class="d-flex gap-2 justify-content-end">
              <button type="button" class="btn btn-secondary btn-sm" (click)="closeForm()">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary btn-sm" [disabled]="saving() || form.invalid">
                <span *ngIf="saving()" class="spinner-border spinner-border-sm me-1"></span>
                <i class="bi bi-save me-1"></i>
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
  perfilesFiltrados = signal<Perfil[]>([]);
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

  // Variables para búsqueda y filtros
  terminoBusqueda: string = '';
  filtroAdmin: string = '';

  form!: FormGroup;

  // Validador personalizado: No solo espacios
  noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const isWhitespace = (control.value || '').trim().length === 0;
    return isWhitespace ? { noWhitespace: true } : null;
  }

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
      strNombrePerfil: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúñÑÁÉÍÓÚ\s-]+$/),
        this.noWhitespaceValidator
      ]],
      bitAdministrador: [false],
      strDescripcion: ['', [
        Validators.maxLength(255)
      ]]
    });
  }

  onDescripcionInput(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    let value = textarea.value;
    
    // Limitar a 255 caracteres
    if (value.length > 255) {
      value = value.slice(0, 255);
      this.form.patchValue({ strDescripcion: value });
    }
    
    this.descripcionLength.set(value.length);
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
        this.aplicarFiltros();
      },
      error: () => this.loading.set(false)
    });
  }

  // 🔍 Aplicar filtros de búsqueda y tipo de administrador
  aplicarFiltros() {
    let filtrados = [...this.perfiles()];
    
    // Filtro por texto (nombre o descripción)
    if (this.terminoBusqueda.trim()) {
      const term = this.terminoBusqueda.toLowerCase().trim();
      filtrados = filtrados.filter(p =>
        p.strNombrePerfil.toLowerCase().includes(term) ||
        (p.strDescripcion && p.strDescripcion.toLowerCase().includes(term))
      );
    }
    
    // Filtro por tipo de administrador
    if (this.filtroAdmin === 'admin') {
      filtrados = filtrados.filter(p => p.bitAdministrador === true);
    } else if (this.filtroAdmin === 'no-admin') {
      filtrados = filtrados.filter(p => p.bitAdministrador === false);
    }
    
    this.perfilesFiltrados.set(filtrados);
  }

  // Limpiar búsqueda y filtros
  limpiarBusqueda() {
    this.terminoBusqueda = '';
    this.filtroAdmin = '';
    this.aplicarFiltros();
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
    this.form.patchValue({
      strNombrePerfil: p.strNombrePerfil,
      bitAdministrador: p.bitAdministrador,
      strDescripcion: p.strDescripcion || ''
    });
    this.descripcionLength.set(p.strDescripcion?.length || 0);
    this.showForm.set(true);
  }

  viewDetail(p: Perfil) { 
    this.detailItem.set(p); 
  }

  closeForm() { 
    this.showForm.set(false); 
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c.touched);
  }

  saveForm() {
    this.form.markAllAsTouched();
    
    if (this.form.invalid) {
      // Mostrar mensaje específico del error
      const nombreControl = this.form.get('strNombrePerfil');
      if (nombreControl?.hasError('required')) {
        this.formError.set('El nombre del perfil es requerido');
      } else if (nombreControl?.hasError('minlength')) {
        this.formError.set('El nombre del perfil debe tener al menos 3 caracteres');
      } else if (nombreControl?.hasError('maxlength')) {
        this.formError.set('El nombre del perfil no puede exceder 50 caracteres');
      } else if (nombreControl?.hasError('pattern')) {
        this.formError.set('El nombre del perfil solo puede contener letras, espacios y guiones');
      } else if (nombreControl?.hasError('noWhitespace')) {
        this.formError.set('El nombre del perfil no puede contener solo espacios');
      } else {
        this.formError.set('Por favor complete los campos requeridos correctamente');
      }
      return;
    }
    
    this.saving.set(true);
    this.formError.set('');

    const data = this.form.value as Perfil;
    // Trim al nombre
    data.strNombrePerfil = data.strNombrePerfil.trim();
    const id = this.editingId();

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
        this.formError.set(err.error?.message || 'Error al guardar el perfil');
      }
    });
  }

  deletePerfil(p: Perfil) {
    if (!confirm(`¿Eliminar el perfil "${p.strNombrePerfil}"?`)) return;
    this.perfilService.delete(p.id!).subscribe({
      next: () => this.loadPage(this.currentPage()),
      error: err => alert(err.error?.message || 'Error al eliminar el perfil')
    });
  }
}