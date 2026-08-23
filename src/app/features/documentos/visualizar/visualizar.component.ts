import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DocumentosService } from '../../../core/services/documentos.service';
import { PacienteService } from '../../../core/services/paciente.service';
import { Exame, Receita, Diagnostico } from '../../../core/models';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ExameFormComponent } from '../exame-form/exame-form.component';
import { ReceitaFormComponent } from '../receita-form/receita-form.component';
import { DiagnosticoFormComponent } from '../diagnostico-form/diagnostico-form.component';

const TEXTO_CONFIRMACAO_EXCLUSAO =
  'Essa ação irá excluir permanentemente do sistema, tem certeza que deseja continuar?';

@Component({
  selector: 'app-visualizar',
  standalone: true,
  imports: [CommonModule, DialogModule, ExameFormComponent, ReceitaFormComponent, DiagnosticoFormComponent],
  templateUrl: './visualizar.component.html',
  styleUrl: './visualizar.component.scss'
})
export class VisualizarComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private documentosService = inject(DocumentosService);
  private pacienteService = inject(PacienteService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  tabAtiva = signal<'exames' | 'receitas' | 'diagnosticos'>('exames');
  idAgendamento = signal<number | null>(null);

  exames = signal<Exame[]>([]);
  receitas = signal<Receita[]>([]);
  diagnosticos = signal<Diagnostico[]>([]);
  carregando = signal(false);

  exameEmEdicao = signal<Exame | null>(null);
  receitaEmEdicao = signal<Receita | null>(null);
  diagnosticoEmEdicao = signal<Diagnostico | null>(null);

  ngOnInit(): void {
    this.carregarDados();
  }

  private carregarDados(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.idAgendamento.set(Number(idParam));
      this.carregarDadosDoAgendamento(this.idAgendamento()!);
    } else {
      this.carregarDadosGlobais();
    }
  }

  carregarDadosDoAgendamento(id: number): void {
    this.carregando.set(true);

    forkJoin({
      exames: this.documentosService.buscarExamesPorAgendamento(id).pipe(catchError(() => of([]))),
      receitas: this.documentosService.buscarReceitasPorAgendamento(id).pipe(catchError(() => of([]))),
      diagnosticos: this.documentosService.buscarDiagnosticosPorAgendamento(id).pipe(catchError(() => of([])))
    }).pipe(
      finalize(() => this.carregando.set(false))
    ).subscribe(res => {
      this.exames.set(res.exames);
      this.receitas.set(res.receitas);
      this.diagnosticos.set(res.diagnosticos);
    });
  }

  carregarDadosGlobais(): void {
    this.carregando.set(true);
    const idPaciente = this.pacienteService.getIdPacienteSelecionado();

    if (!idPaciente) {
      this.carregando.set(false);
      return;
    }

    forkJoin({
      exames: this.documentosService.listarExamesGerais(idPaciente).pipe(catchError(() => of([]))),
      receitas: this.documentosService.listarReceitasGerais(idPaciente).pipe(catchError(() => of([]))),
      diagnosticos: this.documentosService.listarDiagnosticosGerais(idPaciente).pipe(catchError(() => of([])))
    }).pipe(
      finalize(() => this.carregando.set(false))
    ).subscribe(res => {
      this.exames.set(res.exames);
      this.receitas.set(res.receitas);
      this.diagnosticos.set(res.diagnosticos);
    });
  }

  // --- Exames ---
  editarExame(exame: Exame): void {
    this.exameEmEdicao.set(exame);
  }

  fecharEdicaoExame(): void {
    this.exameEmEdicao.set(null);
  }

  aoSalvarExame(): void {
    this.exameEmEdicao.set(null);
    this.carregarDados();
  }

  excluirExame(exame: Exame): void {
    this.confirmationService.confirm({
      message: TEXTO_CONFIRMACAO_EXCLUSAO,
      header: 'Excluir exame',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.documentosService.excluirExame(exame.id!).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Exame excluído' });
            this.carregarDados();
          },
          error: (err) => console.error('Erro ao excluir exame:', err)
        });
      }
    });
  }

  // --- Receitas ---
  editarReceita(receita: Receita): void {
    this.receitaEmEdicao.set(receita);
  }

  fecharEdicaoReceita(): void {
    this.receitaEmEdicao.set(null);
  }

  aoSalvarReceita(): void {
    this.receitaEmEdicao.set(null);
    this.carregarDados();
  }

  excluirReceita(receita: Receita): void {
    this.confirmationService.confirm({
      message: TEXTO_CONFIRMACAO_EXCLUSAO,
      header: 'Excluir receita',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.documentosService.excluirReceita(receita.id!).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Receita excluída' });
            this.carregarDados();
          },
          error: (err) => console.error('Erro ao excluir receita:', err)
        });
      }
    });
  }

  // --- Diagnósticos ---
  editarDiagnostico(diagnostico: Diagnostico): void {
    this.diagnosticoEmEdicao.set(diagnostico);
  }

  fecharEdicaoDiagnostico(): void {
    this.diagnosticoEmEdicao.set(null);
  }

  aoSalvarDiagnostico(): void {
    this.diagnosticoEmEdicao.set(null);
    this.carregarDados();
  }

  excluirDiagnostico(diagnostico: Diagnostico): void {
    this.confirmationService.confirm({
      message: TEXTO_CONFIRMACAO_EXCLUSAO,
      header: 'Excluir diagnóstico',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.documentosService.excluirDiagnostico(diagnostico.id!).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Diagnóstico excluído' });
            this.carregarDados();
          },
          error: (err) => console.error('Erro ao excluir diagnóstico:', err)
        });
      }
    });
  }
}
