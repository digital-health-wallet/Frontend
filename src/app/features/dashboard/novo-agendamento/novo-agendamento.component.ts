import { Component, inject, Output, EventEmitter} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePickerModule } from 'primeng/datepicker';
import { AgendamentoService, AgendamentoRequest } from 'src/app/core/services/agendamento.service';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-novo-agendamento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePickerModule, SelectModule],
  providers: [DatePipe],
  templateUrl: './novo-agendamento.component.html',
  styleUrl: './novo-agendamento.component.scss'
})
export class NovoAgendamentoComponent {
  private agendamentoService = inject(AgendamentoService);
  private datePipe = inject(DatePipe);

  @Output() salvoComSucesso = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  // Variáveis vazias aguardando digitação real
  motivo = '';
  profissional = '';
  especialidade = '';
  endereco = '';
  dataAgendamento: Date | null = null;

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
      idPaciente: 1, // Único dado fixo até ter o token de login funcionando
      especialidade: this.especialidade,
      nomeClinica: this.endereco,
      motivoConsulta: this.motivo,
      tipoConsulta: 'CONSULTA', 
      dataAgendamento: this.datePipe.transform(this.dataAgendamento, 'yyyy-MM-dd')!,
      horaAgendamento: this.datePipe.transform(this.dataAgendamento, 'HH:mm:ss')!
    };

    // Chamada real pro backend
    this.agendamentoService.criar(request).subscribe({
      next: () => {
        // Em vez de navegar, nós gritamos no megafone: "Pai, terminei!"
        this.salvoComSucesso.emit();
        this.limparFormulario(); // Zera para a próxima vez que abrir
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
  }

  sincronizarGoogle(): void {
    console.log('Em breve: Integração OAuth2 Google Calendar');
  }
}