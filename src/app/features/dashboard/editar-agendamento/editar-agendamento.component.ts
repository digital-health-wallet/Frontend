import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { DatePickerModule } from 'primeng/datepicker';
import { AgendamentoService, AgendamentoRequest } from 'src/app/core/services/agendamento.service';

@Component({
  selector: 'app-editar-agendamento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePickerModule],
  providers: [DatePipe],
  templateUrl: './editar-agendamento.component.html',
  styleUrl: './editar-agendamento.component.scss'
})
export class EditarAgendamentoComponent implements OnInit {
  // Injeções
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private agendamentoService = inject(AgendamentoService);
  private datePipe = inject(DatePipe);

  idAgendamento!: number;
  
  // Variáveis vazias
  motivo = '';
  profissional = '';
  especialidade = '';
  endereco = '';
  dataAgendamento: Date | null = null;

  ngOnInit(): void {
    // 1. Pega o ID real da URL (ex: /agendamentos/editar/5)
    const idParam = this.route.snapshot.paramMap.get('id');
    
    if (idParam) {
      this.idAgendamento = Number(idParam);
      this.carregarDadosDoBanco();
    }
  }

  carregarDadosDoBanco(): void {
    // 2. Busca do backend (H2) e preenche a tela
    this.agendamentoService.buscarPorId(this.idAgendamento).subscribe({
      next: (dados) => {
        this.especialidade = dados.especialidade;
        this.endereco = dados.nomeClinica;
        this.motivo = dados.motivoConsulta;
        
        // Remonta a data do PrimeNG (juntando a data e hora que vieram separadas da API)
        if (dados.dataAgendamento && dados.horaAgendamento) {
           const [ano, mes, dia] = dados.dataAgendamento.split('-').map(Number);
           const [hora, minuto] = dados.horaAgendamento.split(':').map(Number);
           // Lembrete: Mês no JavaScript começa do 0, então mes - 1
           this.dataAgendamento = new Date(ano, mes - 1, dia, hora, minuto);
        }
      },
      error: (err) => {
        console.error('Agendamento não encontrado no BD', err);
        this.router.navigate(['/agendamentos']); // Expulsa da tela se deu erro
      }
    });
  }

  salvar(): void {
    if (!this.dataAgendamento) return;

    const dataFormatada = this.datePipe.transform(this.dataAgendamento, 'yyyy-MM-dd')!;
    const horaFormatada = this.datePipe.transform(this.dataAgendamento, 'HH:mm:ss')!;

    const request: AgendamentoRequest = {
      idPaciente: 1, 
      especialidade: this.especialidade,
      nomeClinica: this.endereco,
      motivoConsulta: this.motivo,
      tipoConsulta: 'PRESENCIAL',
      dataAgendamento: dataFormatada,
      horaAgendamento: horaFormatada
    };

    // 3. Manda a atualização real pro backend
    this.agendamentoService.atualizar(this.idAgendamento, request).subscribe({
      next: () => this.router.navigate(['/agendamentos']),
      error: (err) => console.error('Erro ao atualizar na API:', err)
    });
  }

  sincronizarGoogle(): void {
    console.log('Em breve: Integração OAuth2 Google Calendar');
  }
}