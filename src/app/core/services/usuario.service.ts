import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';
import { Usuario, PaginatedResponse } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl     = `${environment.apiUrl}/usuario`;
  private uploadUrl  = `${environment.apiUrl}/upload`;

  constructor(private http: HttpClient) {}

  getAll(page = 1) {
    return this.http.get<PaginatedResponse<Usuario>>(`${this.apiUrl}?page=${page}`);
  }

  getById(id: number) {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  create(data: Usuario) {
    return this.http.post<{ id: number; message: string }>(this.apiUrl, data);
  }

  update(id: number, data: Partial<Usuario>) {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  uploadImagen(id: number, file: File) {
    const formData = new FormData();
    formData.append('imagen', file);
    return this.http.post<{ message: string; strImagen: string }>(
      `${this.uploadUrl}/usuario/${id}`, formData
    );
  }

  getImageUrl(path: string | null | undefined): string {
    if (!path) return 'assets/avatar-default.png';
    if (path.startsWith('http')) return path;
    return `${environment.apiUrl.replace('/api', '')}${path}`;
  }
}