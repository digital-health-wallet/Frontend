import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { DatePickerModule } from 'primeng/datepicker';
import { AgendamentoService, AgendamentoRequest } from 'src/app/core/services/agendamento.service';
import { ProfissionalService } from '@core/services/profissional.service';
import { PacienteService } from '@core/services/paciente.service';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { ReceitaFormComponent } from '../../documentos/receita-form/receita-form.component';
import { ExameFormComponent } from '../../documentos/exame-form/exame-form.component';
import { DiagnosticoFormComponent } from '../../documentos/diagnostico-form/diagnostico-form.component';

@Component({
  selector: 'app-editar-agendamento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePickerModule, SelectModule, DialogModule, ReceitaFormComponent, ExameFormComponent, DiagnosticoFormComponent],
  providers: [DatePipe],
  templateUrl: './editar-agendamento.component.html',
  styleUrl: './editar-agendamento.component.scss'
})
export class EditarAgendamentoComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private agendamentoService = inject(AgendamentoService);
  private profissionalService = inject(ProfissionalService);
  private pacienteService = inject(PacienteService);
  private datePipe = inject(DatePipe);

  idAgendamento!: number;
  motivo = '';
  especialidade = '';
  endereco = '';
  tipoConsulta = 'CONSULTA';
  dataAgendamento: Date | null = null;
  idProfissionalSelecionado: number | null = null;
  profissionaisOpcoes: { label: string; value: number }[] = [];

  especialidadesOpcoes = [
    { label: 'Alergista', value: 'Alergista' },
    { label: 'Cardiologista', value: 'Cardiologista' },
    { label: 'Dermatologista', value: 'Dermatologista' },
    { label: 'Endocrinologista', value: 'Endocrinologista' },
    { label: 'Gastroenterologista', value: 'Gastroenterologista' },
    { label: 'Ortopedista', value: 'Ortopedista' },
    { label: 'Pediatra', value: 'Pediatra' },
    { label: 'Psiquiatra', value: 'Psiquiatra' },
    { label: 'Urologista', value: 'Urologista' },
    { label: 'Ginecologista', value: 'Ginecologista' },
    { label: 'Cirurgião-Plástico', value: 'Cirurgião-Plástico' }
  ];

  tiposConsultaOpcoes = [
    { label: 'Consulta', value: 'CONSULTA' },
    { label: 'Retorno', value: 'RETORNO' },
    { label: 'Exame', value: 'EXAME' },
    { label: 'Emergência', value: 'EMERGENCIA' }
  ];

  exibirModalReceita = signal(false);
  exibirModalExame = signal(false);
  exibirModalDiagnostico = signal(false);

  ngOnInit(): void {
  const idParam = this.route.snapshot.paramMap.get('id');
  if (idParam) {
    this.idAgendamento = Number(idParam);
    this.carregarProfissionais(() => this.carregarDadosDoBanco());
  }
}
  
carregarProfissionais(callback?: () => void): void {
  this.profissionalService.listarTodos().subscribe({
    next: (dados) => {
      this.profissionaisOpcoes = dados
        .filter(p => p.id !== undefined)
        .map(p => ({ label: p.nomeProfissional ?? '', value: p.id as number }));
      if (callback) callback();
    }
  });
}

  carregarDadosDoBanco(): void {
    this.agendamentoService.buscarPorId(this.idAgendamento).subscribe({
      next: (dados) => {
        this.especialidade = dados.especialidade;
        this.endereco = dados.nomeClinica;
        this.motivo = dados.motivoConsulta;
        if (dados.tipoConsulta) this.tipoConsulta = dados.tipoConsulta;
        if (dados.idProfissional) this.idProfissionalSelecionado = dados.idProfissional;
        if (dados.dataAgendamento && dados.horaAgendamento) {
          const [ano, mes, dia] = dados.dataAgendamento.split('-').map(Number);
          const [hora, minuto] = dados.horaAgendamento.split(':').map(Number);
          this.dataAgendamento = new Date(ano, mes - 1, dia, hora, minuto);
        }
      },
      error: (err) => {
        console.error('Agendamento não encontrado', err);
        this.router.navigate(['/agendamentos']);
      }
    });
  }

  salvar(): void {
    if (!this.dataAgendamento) return;
    const request: AgendamentoRequest = {
      idPaciente: this.pacienteService.getIdPacienteSelecionado()!,
      idProfissional: this.idProfissionalSelecionado ?? undefined,
      especialidade: this.especialidade,
      nomeClinica: this.endereco,
      motivoConsulta: this.motivo,
      tipoConsulta: this.tipoConsulta,
      dataAgendamento: this.datePipe.transform(this.dataAgendamento, 'yyyy-MM-dd')!,
      horaAgendamento: this.datePipe.transform(this.dataAgendamento, 'HH:mm:ss')!
    };
    this.agendamentoService.atualizar(this.idAgendamento, request).subscribe({
      next: () => this.router.navigate(['/agendamentos']),
      error: (err) => console.error('Erro ao atualizar:', err)
    });
  }
}