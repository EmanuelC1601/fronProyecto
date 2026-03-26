import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
    return this.http.get<PermisosPerfil[]>(`${this.apiUrl}/perfil/${idPerfil}`);
  }

  create(data: PermisosPerfil) {
    return this.http.post<{ id: number; message: string }>(this.apiUrl, data);
  }

  update(id: number, data: PermisosPerfil) {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}