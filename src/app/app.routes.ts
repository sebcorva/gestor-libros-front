import { Routes } from '@angular/router';

import { LibroDetailComponent } from './components/libro-detail/libro-detail.component';
import { LibroFormComponent } from './components/libro-form/libro-form.component';
import { LibroListComponent } from './components/libro-list/libro-list.component';

// MVC - Controlador: decide qué vista se muestra según la URL.
export const routes: Routes = [
  { path: '', redirectTo: 'libros', pathMatch: 'full' },
  { path: 'libros', component: LibroListComponent },
  { path: 'libros/nuevo', component: LibroFormComponent },
  { path: 'libros/:id', component: LibroDetailComponent },
  { path: 'libros/:id/editar', component: LibroFormComponent },
];
