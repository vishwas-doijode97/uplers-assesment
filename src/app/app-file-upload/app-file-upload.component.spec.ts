import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppFileUploadComponent } from './app-file-upload.component';

describe('AppFileUploadComponent', () => {
  let component: AppFileUploadComponent;
  let fixture: ComponentFixture<AppFileUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppFileUploadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppFileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
