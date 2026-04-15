import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment.prod';
import { PermisosPerfil, PaginatedResponse } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class PermisosPerfilService {
  private apiUrl = `${environment.apiUrl}/permisos-perfil`;

  constructor(private http: HttpClient) {}

  getAll(page = 1) {
    return this.http.get<PaginatedResponse<PermisosPerfil>>(`${this.apiUrl}?page=${page}`);
  }

  getById(id: number) {
    return this.http.get<PermisosPerfil>(`${this.apiUrl}/${id}`);
  }

  getByPerfil(idPerfil: number) {
    return this.http.get<any[]>(`${this.apiUrl}/perfil/${idPerfil}`).pipe(
      map(permisos => {
        // Normalizar los datos: convertir cualquier valor a boolean usando !! (doble negación)
        return permisos.map(p => ({
          ...p,
          bitAgregar: !!p.bitAgregar,
          bitEditar: !!p.bitEditar,
          bitEliminar: !!p.bitEliminar,
          bitConsulta: !!p.bitConsulta,
          bitDetalle: !!p.bitDetalle
        } as PermisosPerfil));
      })
    );
  }

  create(data: PermisosPerfil) {
    // Convertir boolean a 1/0 para el backend
    const payload = {
      idModulo: data.idModulo,
      idPerfil: data.idPerfil,
      bitAgregar: data.bitAgregar ? 1 : 0,
      bitEditar: data.bitEditar ? 1 : 0,
      bitEliminar: data.bitEliminar ? 1 : 0,
      bitConsulta: data.bitConsulta ? 1 : 0,
      bitDetalle: data.bitDetalle ? 1 : 0
    };
    return this.http.post<{ id: number; message: string }>(this.apiUrl, payload);
  }

  update(id: number, data: PermisosPerfil) {
    // Convertir boolean a 1/0 para el backend
    const payload = {
      idModulo: data.idModulo,
      idPerfil: data.idPerfil,
      bitAgregar: data.bitAgregar ? 1 : 0,
      bitEditar: data.bitEditar ? 1 : 0,
      bitEliminar: data.bitEliminar ? 1 : 0,
      bitConsulta: data.bitConsulta ? 1 : 0,
      bitDetalle: data.bitDetalle ? 1 : 0
    };
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}