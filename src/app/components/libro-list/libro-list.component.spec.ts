import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LibroListComponent } from './libro-list.component';

describe('LibroListComponent', () => {
  let component: LibroListComponent;
  let fixture: ComponentFixture<LibroListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibroListComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LibroListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
