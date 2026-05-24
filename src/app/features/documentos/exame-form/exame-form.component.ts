import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DocumentosService } from '../../../core/services/documentos.service';
import { Exame } from '../../../core/models';

@Component({
  selector: 'app-exame-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule],
  templateUrl: './exame-form.component.html',
  styleUrl: './exame-form.component.scss'
})
export class ExameFormComponent {
  // Opcional: pode ser nulo se for inserido direto na aba de Documentos Avulsos
  @Input() idAgendamento?: number | null = null; 
  @Output() aoSalvar = new EventEmitter<void>();

  private documentosService = inject(DocumentosService);

  nomeExame = '';
  dataExame = '';
  observacoes = '';
  carregando = false;

  arquivoBase64: string | null = null;
  nomeArquivo = '';

  salvar(): void { 
    if (!this.nomeExame || !this.dataExame) {
      alert('Preencha o nome e a data do exame!');
      return;
    }

    this.carregando = true;

    const novoExame: Exame = {
      idAgendamento: this.idAgendamento, // Vai nulo se for avulso, vai o ID se for na consulta
      nomeExame: this.nomeExame,
      dataHoraExame: this.dataExame,
      observacoes: this.observacoes,
      uploads: this.arquivoBase64 ? [{ base64: this.arquivoBase64 }] : []
    };

    this.documentosService.salvarExame(novoExame).subscribe({
      next: (res) => {
        console.log('Exame salvo no banco!', res);
        this.carregando = false;
        
        // Limpa os campos
        this.nomeExame = '';
        this.dataExame = '';
        this.observacoes = '';
        
        // Avisa o pai pra fechar o modal
        this.aoSalvar.emit(); 
      },
      error: (erro) => {
        console.error('Erro ao salvar exame:', erro);
        alert('Erro ao salvar o exame. Verifique o console.');
        this.carregando = false;
      }
    });
  }


onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.nomeArquivo = file.name;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.arquivoBase64 = e.target.result; // Salva o Base64
      };
      reader.readAsDataURL(file); // Dispara a leitura
    }
  }
}