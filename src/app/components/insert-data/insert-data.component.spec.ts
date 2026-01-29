import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertDataComponent } from './insert-data.component';

describe('InsertDataComponent', () => {
  let component: InsertDataComponent;
  let fixture: ComponentFixture<InsertDataComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InsertDataComponent]
    });
    fixture = TestBed.createComponent(InsertDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
