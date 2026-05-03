import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Profissional } from '@core/models';
import { ProfissionalService } from '@core/services/profissional.service';

@Component({
  selector: 'app-contatos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contatos.component.html',
  styleUrl: './contatos.component.scss'
})
export class ContatosComponent implements OnInit {
  private profissionalService = inject(ProfissionalService);
  private http = inject(HttpClient);

  profissionalSelecionado = signal<Profissional | null>(null);
  profissionais = signal<Profissional[]>([]);
  exibirFormulario = signal(false);

  form = this.formVazio();

  formVazio() {
    return {
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

  ngOnInit(): void {
    this.carregarProfissionais();
  }

  carregarProfissionais(): void {
    this.profissionalService.listarTodos().subscribe({
      next: (dados) => this.profissionais.set(dados),
      error: (erro) => console.error('Erro ao carregar contatos:', erro)
    });
  }

  abrirFormulario(): void {
    this.form = this.formVazio();
    this.exibirFormulario.set(true);
  }

  fecharFormulario(): void {
    this.exibirFormulario.set(false);
  }

  buscarCep(): void {
    const cep = this.form.cep.replace(/\D/g, '');
    if (cep.length !== 8) return;
    this.http.get<any>(`https://viacep.com.br/ws/${cep}/json/`).subscribe({
      next: (dados) => {
        if (!dados.erro) {
          this.form.logradouro = dados.logradouro;
          this.form.bairro = dados.bairro;
          this.form.cidade = dados.localidade;
          this.form.estado = dados.uf;
        }
      }
    });
  }

  salvarProfissional(): void {
    const payload: any = {
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
        this.fecharFormulario();
        this.carregarProfissionais();
      },
      error: (erro) => console.error('Erro ao salvar profissional:', erro)
    });
  }

  verDetalhes(prof: Profissional): void {
    this.profissionalSelecionado.set(prof);
  }

  fecharDetalhes(): void {
    this.profissionalSelecionado.set(null);
  }
}