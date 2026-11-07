import { Routes } from '@angular/router';

import { LibroDetailComponent } from './components/libro-detail/libro-detail.component';
import { LibroListComponent } from './components/libro-list/libro-list.component';

// MVC - Controlador: decide qué vista se muestra según la URL.
export const routes: Routes = [
  { path: '', redirectTo: 'libros', pathMatch: 'full' },
  { path: 'libros', component: LibroListComponent },
  // 'libros/nuevo' (#6) debe ir ANTES de 'libros/:id', o "nuevo" se toma como id.
  { path: 'libros/:id', component: LibroDetailComponent },
];
