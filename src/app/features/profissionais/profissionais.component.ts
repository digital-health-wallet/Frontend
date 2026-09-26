import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Profissional } from '@core/models';
import { ProfissionalService } from '@core/services/profissional.service';
import { ViaCep } from '@core/services/viacep.service';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-profissionais',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule],
  templateUrl: './profissionais.component.html',
  styleUrl: './profissionais.component.scss'
})
export class ProfissionaisComponent implements OnInit {
  private profissionalService = inject(ProfissionalService);
  private viaCepService = inject(ViaCep);
  private messageService = inject(MessageService);

  profissionais = signal<Profissional[]>([]);
  exibirFormulario = signal(false);
  somenteVisualizacao = signal(false);
  submetido = signal(false);

  form: any = {
    id: null,
    nomeProfissional: '',
    especialidade: '',
    nomeClinica: '',
    contato: '',
    email: '',
    numeroIdentificacaoProfissional: '',
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: ''
  };

  ngOnInit(): void {
    this.carregarProfissionais();
  }

  carregarProfissionais(): void {
    this.profissionalService.listarTodos().subscribe({
      next: (dados) => this.profissionais.set(dados),
      error: (erro) => console.error('Erro ao carregar profissionais:', erro)
    });
  }

  buscarCep(): void {
    const cep = this.form.cep?.replace(/\D/g, '');
    
    if (cep?.length === 8) {
      this.viaCepService.buscarCep(cep).subscribe({
        next: (dados) => {
          if (dados.erro) {
            this.avisarPreenchimentoManual();
            return;
          }
          this.form.logradouro = dados.logradouro;
          this.form.bairro = dados.bairro;
          this.form.cidade = dados.localidade;
          this.form.estado = dados.uf;
        },
        // UC02 - Fluxo Alternativo: sem resposta do ViaCEP o endereço é digitado à mão.
        error: () => this.avisarPreenchimentoManual()
      });
    }
  }

  abrirFormulario(profissional?: any, somenteVisualizacao = false): void {
    this.somenteVisualizacao.set(somenteVisualizacao);
    this.submetido.set(false);
    if (profissional) {
      this.form = {
        id: profissional.id,
        nomeProfissional: profissional.nomeProfissional || '',
        especialidade: profissional.especialidade || '',
        nomeClinica: profissional.nomeClinica || '',
        contato: profissional.contato || '',
        email: profissional.email || '',
        numeroIdentificacaoProfissional: profissional.numeroIdentificacaoProfissional || '',

        cep: profissional.endereco?.cep || '',
        logradouro: profissional.endereco?.logradouro || '',
        numero: profissional.endereco?.numero || '',
        bairro: profissional.endereco?.bairro || '',
        cidade: profissional.endereco?.cidade || '',
        estado: profissional.endereco?.estado || ''
      };
    } else {
      this.resetarFormulario();
    }
    
    this.exibirFormulario.set(true);
  }

  fecharFormulario(): void {
    this.submetido.set(false);
    this.exibirFormulario.set(false);
  }

  entrarModoEdicao(): void {
    this.somenteVisualizacao.set(false);
  }

  private avisarPreenchimentoManual(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'CEP não encontrado',
      detail: 'Preencha o logradouro e o bairro manualmente.'
    });
  }

  salvarProfissional(): void {
    this.submetido.set(true);

    if (!this.form.nomeProfissional || !this.form.especialidade) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos obrigatórios',
        detail: 'Informe o nome do profissional e a especialidade.'
      });
      return;
    }

    const payload = {
      id: this.form.id, 
      nomeProfissional: this.form.nomeProfissional,
      especialidade: this.form.especialidade,
      nomeClinica: this.form.nomeClinica,
      contato: this.form.contato,
      email: this.form.email,
      numeroIdentificacaoProfissional: this.form.numeroIdentificacaoProfissional,
      
      endereco: {
        cep: this.form.cep,
        logradouro: this.form.logradouro,
        numero: this.form.numero,
        bairro: this.form.bairro,
        cidade: this.form.cidade,
        estado: this.form.estado
      }
    };

    this.profissionalService.salvar(payload).subscribe({
      next: () => {
        this.carregarProfissionais(); 
        this.fecharFormulario(); 
      },
      error: (erro) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro ao salvar',
          detail: erro?.error?.mensagem ?? 'Não foi possível salvar o profissional. Tente novamente.'
        });
      }
    });
  }

  private resetarFormulario(): void {
    this.form = {
      id: null, 
      especialidade: '',
      nomeClinica: '',
      contato: '',
      email: '',
      numeroIdentificacaoProfissional: '',
      cep: '',
      logradouro: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: ''
    };
  }
}