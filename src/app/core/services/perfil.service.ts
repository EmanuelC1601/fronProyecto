import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';
import { Perfil, PaginatedResponse } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private apiUrl = `${environment.apiUrl}/perfil`;

  constructor(private http: HttpClient) {}

  getAll(page = 1) {
    return this.http.get<PaginatedResponse<Perfil>>(`${this.apiUrl}?page=${page}`);
  }

  getById(id: number) {
    return this.http.get<Perfil>(`${this.apiUrl}/${id}`);
  }

  create(data: Perfil) {
    return this.http.post<{ id: number; message: string }>(this.apiUrl, data);
  }

  update(id: number, data: Perfil) {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}