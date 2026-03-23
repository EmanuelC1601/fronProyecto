import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [NgFor, NgIf],
  template: `
    <nav *ngIf="pages > 1">
      <ul class="pagination pagination-sm mb-0">
        <li class="page-item" [class.disabled]="currentPage === 1">
          <button class="page-link" (click)="changePage(currentPage - 1)">
            <i class="bi bi-chevron-left"></i>
          </button>
        </li>
        <li
          *ngFor="let p of getPages()"
          class="page-item"
          [class.active]="p === currentPage">
          <button class="page-link" (click)="changePage(p)">{{ p }}</button>
        </li>
        <li class="page-item" [class.disabled]="currentPage === pages">
          <button class="page-link" (click)="changePage(currentPage + 1)">
            <i class="bi bi-chevron-right"></i>
          </button>
        </li>
      </ul>
    </nav>
    <small class="text-muted ms-3" *ngIf="total > 0">
      {{ total }} registro(s) — Página {{ currentPage }} de {{ pages }}
    </small>
  `
})
export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() pages = 1;
  @Input() total = 0;
  @Output() pageChange = new EventEmitter<number>();

  changePage(p: number) {
    if (p < 1 || p > this.pages) return;
    this.pageChange.emit(p);
  }

  getPages(): number[] {
    return Array.from({ length: this.pages }, (_, i) => i + 1);
  }
}