import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LibroService } from './libro.service';

describe('LibroService', () => {
  let service: LibroService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(LibroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
