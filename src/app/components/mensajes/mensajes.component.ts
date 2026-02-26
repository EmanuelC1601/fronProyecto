import { Component, OnInit } from '@angular/core';
import { MensajeService, Mensaje, PaginatedResponse } from '../../services/mensaje.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-mensajes',
  templateUrl: './mensajes.component.html',
  styleUrls: ['./mensajes.component.css']
})
export class MensajesComponent implements OnInit {
  mensajes: Mensaje[] = [];
  paginacion = { page: 1, limit: 10, total: 0, pages: 0 };

  formData: Mensaje = { nombre_completo: '', email: '', edad: 18, mensaje: '' };
  editando = false;
  idEditando: number | null = null;
  mostrarFormulario = false;

  // Filtros
  searchTerm: string = '';
  edadMin?: number;
  edadMax?: number;

  private searchSubject = new Subject<string>();

  constructor(private mensajeService: MensajeService) {}

  ngOnInit(): void {
    this.cargarMensajes();

    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.paginacion.page = 1;
      this.cargarMensajes();
    });
  }

  cargarMensajes(): void {
    this.mensajeService.getMensajes(
      this.paginacion.page,
      this.paginacion.limit,
      this.searchTerm,
      this.edadMin,
      this.edadMax
    ).subscribe((res: PaginatedResponse) => {
      this.mensajes = res.data;
      this.paginacion = res.pagination;
    });
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  onAgeFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    if (value) {
      const [min, max] = value.split('-').map(Number);
      this.edadMin = min;
      this.edadMax = max;
    } else {
      this.edadMin = undefined;
      this.edadMax = undefined;
    }
    this.paginacion.page = 1;
    this.cargarMensajes();
  }

  abrirFormularioNuevo(): void {
    this.mostrarFormulario = true;
    this.editando = false;
    this.idEditando = null;
    this.formData = { nombre_completo: '', email: '', edad: 18, mensaje: '' };
  }

  cancelar(): void {
    this.mostrarFormulario = false;
    this.editando = false;
    this.idEditando = null;
    this.formData = { nombre_completo: '', email: '', edad: 18, mensaje: '' };
  }

  guardarMensaje(): void {
    if (this.editando && this.idEditando) {
      this.mensajeService.updateMensaje(this.idEditando, this.formData).subscribe({
        next: () => {
          this.cancelar();
          this.paginacion.page = 1; // 👈 Volver a la primera página
          this.cargarMensajes();
        },
        error: (err) => {
          console.error(err);
          alert('Error al actualizar: ' + (err.error?.errors?.join(', ') || 'Error desconocido'));
        }
      });
    } else {
      this.mensajeService.createMensaje(this.formData).subscribe({
        next: () => {
          this.cancelar();
          this.paginacion.page = 1; // 👈 Volver a la primera página
          this.cargarMensajes();
        },
        error: (err) => {
          console.error(err);
          alert('Error al crear: ' + (err.error?.errors?.join(', ') || 'Error desconocido'));
        }
      });
    }
  }

  editarMensaje(mensaje: Mensaje): void {
    this.mostrarFormulario = true;
    this.editando = true;
    this.idEditando = mensaje.id!;
    this.formData = { ...mensaje };
  }

  eliminarMensaje(id: number): void {
    if (confirm('¿Eliminar este mensaje?')) {
      this.mensajeService.deleteMensaje(id).subscribe(() => {
        // Después de eliminar, puede ser conveniente mantener la página actual
        // o volver a la primera si la página actual queda vacía.
        // Aquí optamos por recargar la misma página (se ajusta automáticamente si es necesario)
        this.cargarMensajes();
      });
    }
  }

  cambiarPagina(page: number): void {
    this.paginacion.page = page;
    this.cargarMensajes();
  }
}