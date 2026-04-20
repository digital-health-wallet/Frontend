import { Component, signal, computed, ViewChild, OnInit, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SelectModule } from 'primeng/select'; 
import { AgendamentoResumo, StatusAgendamento } from '@core/models';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { Popover } from 'primeng/popover';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DividerModule } from 'primeng/divider';
import { TabsModule } from 'primeng/tabs';
import { trigger, transition, style, animate } from '@angular/animations';
import { AgendamentoService, AgendamentoResponse } from '@core/services/agendamento.service';


@Component({
  selector: 'app-agendamentos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SelectModule, ButtonModule, CheckboxModule,  Popover, ToggleSwitchModule, DividerModule, TabsModule],
  templateUrl: './agendamentos.component.html',
  styleUrl: './agendamentos.component.scss',
   animations: [
    trigger('cardAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class AgendamentosComponent implements OnInit {

  private agendamentoService = inject(AgendamentoService);

  private readonly ID_PACIENTE = 1;

  ngOnInit() {
    this.carregarAgendamentos();
  }

  @ViewChild('filtroPopover') filtroPopover!: Popover;
  termoBusca = signal('');
  abaAtiva = signal('ativos');

  filtroStatus = signal<Record<string, boolean>>({
  CONFIRMADO: false,
  AGENDADO: false,
  FINALIZADO: false,
  CANCELADO: false
});
  filtroFavoritos = signal(false);

  agendamentosArquivadosSignal = signal<AgendamentoResumo[]>([]);
  agendamentosArquivados = computed(() => this.agendamentosArquivadosSignal());
  agendamentos = signal<AgendamentoResumo[]>([]);


  toggleFiltro(event: Event) {
    this.filtroPopover.toggle(event);
  }

  limparFiltros() {
  this.filtroStatus.set({ CONFIRMADO: false, AGENDADO: false, FINALIZADO: false, CANCELADO: false });
  this.filtroFavoritos.set(false);
}

getStatusClassById(id: number): string {
  const ag = this.agendamentos().find(a => a.id === id);
  const status = ag?.status ?? 'AGENDADO';
  const map: Record<string, string> = {
    CONFIRMADO: 'confirmada',
    AGENDADO: 'andamento',
    FINALIZADO: 'finalizada',
    CANCELADO: 'cancelada'
  };
  return map[status];
}

toggleFiltroStatus(value: string) {
  this.filtroStatus.update(f => ({ ...f, [value]: !f[value] }));
}

toggleFiltroFavoritos() {
  this.filtroFavoritos.update(v => !v);
}

  opcoesStatus: { label: string, value: StatusAgendamento }[] = [
    { label: 'Confirmada', value: 'CONFIRMADO' },
    { label: 'Em andamento', value: 'AGENDADO' },
    { label: 'Finalizada', value: 'FINALIZADO' },
    { label: 'Cancelada', value: 'CANCELADO' }
  ];

  agendamentosExibidos = computed(() => {
  const busca = this.termoBusca().toLowerCase();
  const filtros = this.filtroStatus();
  const temFiltroStatus = Object.values(filtros).some(v => v);
  const favoritos = this.filtroFavoritos();

  return this.agendamentos()
    .filter(ag => {
      const buscaOk = ag.especialidade.toLowerCase().includes(busca) ||
                      ag.nomeClinica.toLowerCase().includes(busca);
      const statusOk = !temFiltroStatus || filtros[ag.status];
      const favOk = !favoritos || ag.favorito;
      return buscaOk && statusOk && favOk;
    })
    .sort((a, b) => Number(b.favorito) - Number(a.favorito));
});

  onStatusChange(agendamento: AgendamentoResumo, novoStatus: StatusAgendamento): void {
  console.log('chamado', agendamento.id, novoStatus);
  this.agendamentoService.atualizarStatus(agendamento.id, novoStatus)
    .subscribe({
      next: (response) => {
        this.agendamentos.update(lista =>
          lista.map(item => item.id === agendamento.id
            ? { ...item, status: response.status as StatusAgendamento }
            : item
          )
        );
      },
      error: (err) => console.error('Erro:', err)
    });
}

  arquivarSelecionados(): void {
    const selecionados = this.agendamentos().filter(ag => ag.selecionado);
    if (selecionados.length === 0) return;

    selecionados.forEach(ag => {
      this.agendamentoService.arquivar(ag.id).subscribe(() => {
        this.agendamentos.update(lista => lista.filter(item => item.id !== ag.id));
      });
    });
  }

  toggleFavorito(ag: AgendamentoResumo): void {
    this.agendamentoService.toggleFavorito(ag.id).subscribe(() => {
      this.agendamentos.update(lista =>
        lista
          .map(item => item.id === ag.id ? { ...item, favorito: !item.favorito } : item)
          .sort((a, b) => Number(b.favorito) - Number(a.favorito))
      );
    });
  }

  getStatusClass(status: StatusAgendamento): string {
    const map: Record<StatusAgendamento, string> = { CONFIRMADO: 'confirmada', AGENDADO: 'andamento', FINALIZADO: 'finalizada', CANCELADO: 'cancelada' };
    return map[status];
  }

  carregarAgendamentos() {
    this.agendamentoService.listarAtivos(this.ID_PACIENTE).subscribe(dados => {
      this.agendamentos.set(dados.map(ag => ({
        id: ag.id,
        especialidade: ag.especialidade,
        nomeClinica: ag.nomeClinica,
        data: ag.dataAgendamento,
        hora: ag.horaAgendamento,
        status: ag.status as StatusAgendamento,
        favorito: ag.favorito,
        selecionado: false
      })));
    });

    this.agendamentoService.listarArquivados(this.ID_PACIENTE).subscribe(dados => {
      this.agendamentosArquivadosSignal.set(dados.map(ag => ({
        id: ag.id,
        especialidade: ag.especialidade,
        nomeClinica: ag.nomeClinica,
        data: ag.dataAgendamento,
        hora: ag.horaAgendamento,
        status: ag.status as StatusAgendamento,
        favorito: ag.favorito,
        selecionado: false
      })));
    });
  }
}