import { Routes } from '@angular/router';
//import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // ---- Auth (sem sidebar) ----
  //TODO

  // ---- App (com sidebar) ----
  {
    path: '',
    loadComponent: () =>
      import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    //canActivate: [authGuard],
    children: [
      {
        path: 'agendamentos',
        loadComponent: () =>
          import('./features/dashboard/agendamentos/agendamentos.component').then(m => m.AgendamentosComponent),
      },
      

      {
        path: 'contatos',
        loadComponent: () => import('./features/dashboard/contatos/contatos.component').then(m => m.ContatosComponent),
      },
      {
        path: 'documentos',
        loadComponent: () => import('./features/dashboard/documentos/documentos.component').then(m => m.DocumentosComponent),
      },
      {
        path: 'prontuario',
        loadComponent: () => import('./features/dashboard/prontuario/prontuario.component').then(m => m.ProntuarioComponent),
      },
      {
        path: 'profissionais',
        loadComponent: () => import('./features/dashboard/profissionais/profissionais.component').then(m => m.ProfissionaisComponent),
      },
      
      {
        path: '',
        redirectTo: 'agendamentos',
        pathMatch: 'full',
      },
    ],
  },

  // ---- Fallback ----
  { path: '**', redirectTo: 'login' },
];
