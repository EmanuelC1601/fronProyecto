import { Component, Input } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';


export interface BreadcrumbItem {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink],
  template: `
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb mb-0">
        <li class="breadcrumb-item">
          <i class="bi bi-house-fill"></i>
        </li>
        <li
          *ngFor="let item of items; let last = last"
          class="breadcrumb-item"
          [class.active]="last"
          [attr.aria-current]="last ? 'page' : null">
          <a *ngIf="item.url && !last" [routerLink]="item.url">{{ item.label }}</a>
          <span *ngIf="!item.url || last">{{ item.label }}</span>
        </li>
      </ol>
    </nav>
  `
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
}