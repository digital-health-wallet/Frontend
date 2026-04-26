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
        path: 'agendamentos/novo',
        loadComponent: () =>
          import('./features/dashboard/novo-agendamento/novo-agendamento.component').then(m => m.NovoAgendamentoComponent),
      },
      {
        path: 'agendamentos/:id/editar',
        loadComponent: () =>
          import('./features/dashboard/editar-agendamento/editar-agendamento.component').then(m => m.EditarAgendamentoComponent),
      },

      {
        path: 'contatos',
        loadComponent: () => import('./features/contatos/contatos.component').then(m => m.ContatosComponent),
      },
      {
        path: 'documentos',
        loadComponent: () => import('./features/documentos/documentos.component').then(m => m.DocumentosComponent),
      },
      {
        path: 'prontuario',
        loadComponent: () => import('./features/prontuario/prontuario.component').then(m => m.ProntuarioComponent),
      },
      {
        path: 'profissionais',
        loadComponent: () => import('./features/profissionais/profissionais.component').then(m => m.ProfissionaisComponent),
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
