import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { pacienteGuard } from './core/guards/paciente.guard';


export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'meus-pacientes',
    loadComponent: () =>
      import('./features/auth/meus-pacientes/meus-pacientes.component').then(m => m.MeusPacientesComponent),
  },
  {
    path: 'auth/google/callback',
    loadComponent: () =>
      import('./features/auth/google-callback/google-callback.component').then(m => m.GoogleCallbackComponent),
  },
  {
    path: 'emergencia/:codigo',
    loadComponent: () =>
      import('./features/emergencia/emergencia.component').then(m => m.EmergenciaComponent),
  },

  {
    path: '',
    loadComponent: () =>
      import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'agendamentos',
        canActivate: [pacienteGuard],
        loadComponent: () =>
          import('./features/dashboard/agendamentos/agendamentos.component').then(m => m.AgendamentosComponent),
      },
       {
        path: 'agendamentos/novo',
        canActivate: [pacienteGuard],
        loadComponent: () =>
          import('./features/dashboard/novo-agendamento/novo-agendamento.component').then(m => m.NovoAgendamentoComponent),
      },
      {
        path: 'agendamentos/:id/editar',
        canActivate: [pacienteGuard],
        loadComponent: () =>
          import('./features/dashboard/editar-agendamento/editar-agendamento.component').then(m => m.EditarAgendamentoComponent),
      },

      {
        path: 'contatos',
        loadComponent: () => import('./features/contatos/contatos.component').then(m => m.ContatosComponent),
      },
      {
        path: 'documentos',
        canActivate: [pacienteGuard],
        loadComponent: () => import('./features/documentos/adicionar-documento/adicionar-documento.component').then(m => m.AdicionarDocumentoComponent),
      },
      {
        path: 'documentos/visualizar',
        canActivate: [pacienteGuard],
        loadComponent: () => import('./features/documentos/visualizar/visualizar.component').then(m => m.VisualizarComponent),
      },

      {
        path: 'agendamentos/:id/documentos',
        canActivate: [pacienteGuard],
        loadComponent: () => import('./features/documentos/adicionar-documento/adicionar-documento.component').then(m => m.AdicionarDocumentoComponent),
      },
      {
        path: 'agendamentos/:id/documentos/visualizar',
        canActivate: [pacienteGuard],
        loadComponent: () => import('./features/documentos/visualizar/visualizar.component').then(m => m.VisualizarComponent),
      },
      {
        path: 'prontuario',
        loadComponent: () => import('./features/prontuario/prontuario.component').then(m => m.ProntuarioComponent),
      },
      {
        path: 'paciente/gerenciar',
        canActivate: [pacienteGuard],
        loadComponent: () =>
          import('./features/paciente/gerenciar-paciente/gerenciar-paciente.component').then(m => m.GerenciarPacienteComponent),
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

  { path: '**', redirectTo: 'login' },
];