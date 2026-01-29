import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadAndCarouselComponent } from './upload-and-carousel.component';

describe('UploadAndCarouselComponent', () => {
  let component: UploadAndCarouselComponent;
  let fixture: ComponentFixture<UploadAndCarouselComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UploadAndCarouselComponent]
    });
    fixture = TestBed.createComponent(UploadAndCarouselComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
