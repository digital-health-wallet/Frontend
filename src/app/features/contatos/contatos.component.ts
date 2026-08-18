import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contato } from '@core/models';
import { ContatoService } from '@core/services/contato.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-contatos',
  standalone: true,
  imports: [CommonModule, FormsModule, DialogModule, ButtonModule],
  templateUrl: './contatos.component.html',
  styleUrl: './contatos.component.scss'
})
export class ContatosComponent implements OnInit {
  private contatoService = inject(ContatoService);

  contatos = signal<Contato[]>([]);
  exibirFormulario = signal(false);

  form: any = {
    id: null,
    nome: '',
    parentesco: '',
    telefone: '',
    email: ''
  };

  ngOnInit(): void {
    this.carregarContatos();
  }

  carregarContatos(): void {
    this.contatoService.listarTodos().subscribe({
      next: (dados) => this.contatos.set(dados),
      error: (erro) => console.error('Erro ao carregar contatos:', erro)
    });
  }

  abrirFormulario(contato?: Contato): void {
    if (contato) {
      this.form = {
        id: contato.id,
        nome: contato.nome || '',
        parentesco: contato.parentesco || '',
        telefone: contato.telefone || '',
        email: contato.email || ''
      };
    } else {
      this.resetarFormulario();
    }

    this.exibirFormulario.set(true);
  }

  fecharFormulario(): void {
    this.exibirFormulario.set(false);
  }

  salvarContato(): void {
    const payload: Contato = {
      id: this.form.id,
      nome: this.form.nome,
      parentesco: this.form.parentesco,
      telefone: this.form.telefone,
      email: this.form.email
    };

    this.contatoService.salvar(payload).subscribe({
      next: () => {
        this.carregarContatos();
        this.fecharFormulario();
      },
      error: (erro) => {
        console.error('Erro ao salvar:', erro);
        alert('Erro ao salvar contato. Verifique o console do backend.');
      }
    });
  }

  private resetarFormulario(): void {
    this.form = {
      id: null,
      nome: '',
      parentesco: '',
      telefone: '',
      email: ''
    };
  }
}
