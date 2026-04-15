import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AgendamentoResumo, StatusAgendamento } from '@core/models';

@Component({
  selector: 'app-agendamentos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <!-- Header com busca e logo -->
    <div class="top-bar">
      <div class="search-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" placeholder="Pesquisar" [(ngModel)]="termoBusca" />
      </div>
      <div class="logo-small">
        <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
          <path d="M32 4L12 16v16c0 14.4 8.53 27.84 20 31.2C43.47 59.84 52 46.4 52 32V16L32 4z" fill="#1A1A2E"/>
          <path d="M32 20v10h10M32 30H22M32 30v10" stroke="white" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </div>
    </div>

    <!-- Ações -->
    <div class="actions-bar">
      <button class="btn-outline" (click)="toggleFiltro()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
        Filtrar
      </button>
      <button class="btn-outline" (click)="arquivarSelecionados()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="21 8 21 21 3 21 3 8"/>
          <rect x="1" y="3" width="22" height="5"/>
        </svg>
        Arquivar
      </button>
      <a routerLink="/agendamentos/novo" class="btn-outline">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
        Novo
      </a>
    </div>

    <!-- Lista de agendamentos -->
    <div class="agendamentos-lista">
      @for (ag of agendamentos(); track ag.id) {
        <div class="agendamento-card" [class.card-blue-bg]="true">
          <div class="card-left">
            <input type="checkbox" class="ag-check" />
            <span class="star" [class.active]="ag.favorito" (click)="toggleFavorito(ag)">★</span>
            <div class="ag-info">
              <strong>{{ ag.especialidade }} - {{ ag.nomeClinica }}</strong>
              <span class="ag-data">{{ ag.data }} - {{ ag.hora }}</span>
            </div>
          </div>
          <div class="card-right">
            <a [routerLink]="['/agendamentos', ag.id, 'documentos']" class="icon-btn" title="Documentos">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </a>
            <a [routerLink]="['/agendamentos', ag.id, 'editar']" class="icon-btn" title="Editar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </a>
            <div class="status-badge" [ngClass]="getStatusClass(ag.status)">
              {{ getStatusLabel(ag.status) }}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-lg);
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      background: var(--bg-card);
      border: 1.5px solid var(--border-color);
      border-radius: var(--border-radius-full);
      padding: 10px 20px;
      width: 100%;
      max-width: 500px;

      input {
        border: none;
        background: none;
        flex: 1;
        font-size: var(--font-size-sm);
        &::placeholder { color: var(--text-muted); }
      }
    }

    .logo-small { flex-shrink: 0; }

    .actions-bar {
      display: flex;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-lg);
    }

    .agendamentos-lista {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .agendamento-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-md) var(--spacing-lg);
      background: var(--bg-card-blue);
      border-radius: var(--border-radius-md);
      transition: all var(--transition-fast);

      &:hover { box-shadow: var(--shadow-sm); }
    }

    .card-left {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }

    .ag-check {
      accent-color: var(--color-primary);
      width: 18px;
      height: 18px;
    }

    .star {
      font-size: 18px;
      color: var(--text-muted);
      cursor: pointer;
      transition: color var(--transition-fast);

      &.active { color: #F59E0B; }
      &:hover { color: #F59E0B; }
    }

    .ag-info {
      strong { display: block; font-size: var(--font-size-base); }
      .ag-data { font-size: var(--font-size-sm); color: var(--text-secondary); }
    }

    .card-right {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .icon-btn {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--border-radius-sm);
      color: var(--text-secondary);
      transition: all var(--transition-fast);

      &:hover {
        background: rgba(0,0,0,0.05);
        color: var(--text-primary);
      }
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 14px;
      border-radius: var(--border-radius-full);
      font-size: var(--font-size-xs);
      font-weight: 600;
      cursor: pointer;

      &.confirmada { background: var(--status-confirmada); color: white; }
      &.andamento { background: var(--status-andamento); color: var(--text-primary); }
      &.finalizada { background: var(--status-finalizada); color: white; }
      &.cancelada { background: var(--status-cancelada); color: white; }
    }
  `],
})
export class AgendamentosComponent {
  termoBusca = '';

  agendamentos = signal<AgendamentoResumo[]>([
    { id: 1, especialidade: 'Cardiologista', nomeClinica: 'Cuidare', data: '14 de maio', hora: '13h', status: 'C', favorito: true },
    { id: 2, especialidade: 'Fisioterapia', nomeClinica: 'Clínica Boa Vivência', data: '13 de maio', hora: '13h', status: 'A', favorito: false },
    { id: 3, especialidade: 'Anestesiologista', nomeClinica: 'AME', data: '11 de maio', hora: '10h', status: 'R', favorito: true },
  ]);

  getStatusClass(status: StatusAgendamento): string {
    const map: Record<StatusAgendamento, string> = { C: 'confirmada', A: 'andamento', R: 'finalizada', X: 'cancelada' };
    return map[status];
  }

  getStatusLabel(status: StatusAgendamento): string {
    const map: Record<StatusAgendamento, string> = { C: 'Confirmada', A: 'Em andamento', R: 'Finalizada', X: 'Cancelada' };
    return map[status];
  }

  toggleFavorito(ag: AgendamentoResumo): void {
    ag.favorito = !ag.favorito;
  }

  toggleFiltro(): void { /* TODO */ }
  arquivarSelecionados(): void { /* TODO */ }
}
