import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Modulo, PaginatedResponse } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class ModuloService {
  private apiUrl = `${environment.apiUrl}/modulo`;

  constructor(private http: HttpClient) {}

  getAll(page = 1) {
    return this.http.get<PaginatedResponse<Modulo>>(`${this.apiUrl}?page=${page}`);
  }

  getAllSimple() {
    return this.http.get<Modulo[]>(`${this.apiUrl}`);
  }

  getById(id: number) {
    return this.http.get<Modulo>(`${this.apiUrl}/${id}`);
  }

  create(data: Modulo) {
    return this.http.post<{ id: number; message: string }>(this.apiUrl, data);
  }

  update(id: number, data: Modulo) {
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}