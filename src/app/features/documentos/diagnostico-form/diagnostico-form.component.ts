import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button'; 
import { DocumentosService } from '../../../core/services/documentos.service';
import { Diagnostico } from '../../../core/models';

@Component({
  selector: 'app-diagnostico-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule], 
  templateUrl: './diagnostico-form.component.html',
  styleUrl: './diagnostico-form.component.scss'
})
export class DiagnosticoFormComponent {
  @Input() idAgendamento!: number; 
  @Output() aoSalvar = new EventEmitter<void>();

  private documentosService = inject(DocumentosService);

  nome = '';
  cid = '';
  descricao = '';
  doencaCronica = false; 
  carregando = false;

  salvar(): void { 
    if (!this.nome) {
      alert('O nome do diagnóstico é obrigatório!');
      return;
    }

    if (!this.idAgendamento) {
      alert('Erro: Não é possível salvar um diagnóstico fora de uma consulta.');
      return;
    }

    this.carregando = true;

    const novoDiagnostico: Diagnostico = {
      idAgendamento: this.idAgendamento,
      nome: this.nome,
      cid: this.cid,
      descricao: this.descricao,
      doencaCronica: this.doencaCronica
    };

    this.documentosService.salvarDiagnostico(novoDiagnostico).subscribe({
      next: (res) => {
        console.log('Diagnóstico salvo no banco!', res);
        this.carregando = false;

        this.nome = '';
        this.cid = '';
        this.descricao = '';
        this.doencaCronica = false;

        this.aoSalvar.emit();
      },
      error: (erro) => {
        console.error('Erro ao salvar diagnóstico:', erro);
        alert('Erro ao salvar. Verifique o console.');
        this.carregando = false;
      }
    });
  }
}