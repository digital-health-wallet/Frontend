import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Profissional } from '@core/models';
import { ProfissionalService } from '@core/services/profissional.service';
import { ViaCep } from '@core/services/viacep.service'; 
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

  profissionais = signal<Profissional[]>([]);
  exibirFormulario = signal(false);


  form = {
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
          if (!dados.erro) {
            this.form.logradouro = dados.logradouro;
            this.form.bairro = dados.bairro;
            this.form.cidade = dados.localidade;
            this.form.estado = dados.uf;
          }
        },
        error: (err) => console.error('Erro ao buscar CEP', err)
      });
    }
  }

  abrirFormulario(): void {
    this.resetarFormulario();
    this.exibirFormulario.set(true);
  }

  fecharFormulario(): void {
    this.exibirFormulario.set(false);
  }

  salvarProfissional(): void {
    this.profissionalService.salvar(this.form).subscribe({
      next: () => {
        this.carregarProfissionais();
        this.fecharFormulario();
      },
      error: (erro) => alert('Erro ao salvar profissional.')
    });
  }

  private resetarFormulario(): void {
    this.form = {
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
  }
}