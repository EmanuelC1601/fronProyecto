import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { MenuPermiso } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMenu() {
    return this.http.get<MenuPermiso[]>(`${this.apiUrl}/menu`);
  }
}