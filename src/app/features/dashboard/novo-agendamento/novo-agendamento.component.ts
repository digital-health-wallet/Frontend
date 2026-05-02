import { Component, inject, Output, EventEmitter} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePickerModule } from 'primeng/datepicker';
import { AgendamentoService, AgendamentoRequest } from 'src/app/core/services/agendamento.service';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-novo-agendamento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePickerModule, SelectModule, DialogModule, ButtonModule],
  providers: [DatePipe],
  templateUrl: './novo-agendamento.component.html',
  styleUrl: './novo-agendamento.component.scss'
})
export class NovoAgendamentoComponent {
  private agendamentoService = inject(AgendamentoService);
  private datePipe = inject(DatePipe);

  @Output() salvoComSucesso = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  motivo = '';
  profissional = '';
  especialidade = '';
  endereco = '';
  dataAgendamento: Date | null = null;

  tipoConsulta = 'CONSULTA';
  tiposConsultaOpcoes = [
    { label: 'Consulta', value: 'CONSULTA' },
    { label: 'Retorno', value: 'RETORNO' },
    { label: 'Exame', value: 'EXAME' },
    { label: 'Emergência', value: 'EMERGENCIA' }
  ];

  //Google
  exibirModalGoogle = false;
  carregandoGoogle = false;
  sugestoesGoogle: any[] = [];

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
    {label: 'Cirurgião-Plástico', value: 'Cirurgião-Plástico'},
  ];

  salvar(): void {
    if (!this.dataAgendamento) {
      alert('Selecione a data e hora.');
      return;
    }

    const dataFormatada = this.datePipe.transform(this.dataAgendamento, 'yyyy-MM-dd')!;
    const horaFormatada = this.datePipe.transform(this.dataAgendamento, 'HH:mm:ss')!;

    const request: AgendamentoRequest = {
      idPaciente: 1,
      especialidade: this.especialidade,
      nomeClinica: this.endereco,
      motivoConsulta: this.motivo,
      tipoConsulta: this.tipoConsulta,
      dataAgendamento: this.datePipe.transform(this.dataAgendamento, 'yyyy-MM-dd')!,
      horaAgendamento: this.datePipe.transform(this.dataAgendamento, 'HH:mm:ss')!
    };
    this.agendamentoService.criar(request).subscribe({
      next: () => {
        this.salvoComSucesso.emit();
        this.limparFormulario(); 
      },
      error: (err) => console.error('Erro ao salvar:', err)
    });
  }

  limparFormulario() {
    this.motivo = '';
    this.profissional = '';
    this.especialidade = '';
    this.endereco = '';
    this.dataAgendamento = null;
    this.tipoConsulta = 'CONSULTA';
  }

  sincronizarGoogle(): void {
    this.exibirModalGoogle = true;
    this.carregandoGoogle = true;

    const idPaciente = 1; 
    const accessToken = 'TOKEN AQUI'; 

    this.agendamentoService.buscarSugestoesGoogle(idPaciente, accessToken).subscribe({
      next: (dados) => {
        this.sugestoesGoogle = dados;
        this.carregandoGoogle = false;
      },
      error: (err) => {
        console.error('Erro ao buscar no Google', err);
        this.carregandoGoogle = false;
      }
    });
  }

  usarSugestaoGoogle(evento: any): void {
    this.profissional = evento.especialidade; 
    this.endereco = evento.nomeClinica || '';
    
    if (evento.dataAgendamento) {
        const dataString = `${evento.dataAgendamento}T${evento.horaAgendamento || '08:00:00'}`;
        this.dataAgendamento = new Date(dataString);
    }

    this.exibirModalGoogle = false;
  }
}