import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DocumentosService } from '../../../core/services/documentos.service';
import { Receita } from '../../../core/models';

@Component({
  selector: 'app-receita-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule],
  templateUrl: './receita-form.component.html',
  styleUrl: './receita-form.component.scss'
})
export class ReceitaFormComponent {
  @Input() idAgendamento!: number; 
  
  @Output() aoSalvar = new EventEmitter<void>();

  private documentosService = inject(DocumentosService); 

  dataReceita = '';
  medicacao = '';
  posologia = '';
  orientacoes = '';
  carregando = false; 
  arquivoBase64: string | null = null;
  nomeArquivo = '';

  salvar(): void {
    if (!this.medicacao || !this.posologia) {
      alert('Preencha a medicação e a posologia!');
      return;
    }

    this.carregando = true;

    const novaReceita: Receita = {
      idAgendamento: this.idAgendamento,
      orientacoesGerais: this.orientacoes,
      uploads: this.arquivoBase64 ? [{ base64: this.arquivoBase64 }] : [],
      itens: [
        {
          medicamento: { nomeMedicamento: this.medicacao },
          posologia: this.posologia,
          usoContinuo: false
        }
      ]
    };
    this.documentosService.salvarReceita(novaReceita).subscribe({
      next: (respostaBackend) => {
        console.log('Receita salva com sucesso!', respostaBackend);
        this.carregando = false;
        this.medicacao = '';
        this.posologia = '';
        this.orientacoes = '';
        this.aoSalvar.emit(); 
      },
      error: (erro) => {
        console.error('Erro ao salvar receita:', erro);
        alert('Ocorreu um erro ao salvar. Tente novamente.');
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
        this.arquivoBase64 = e.target.result; 
      };
      reader.readAsDataURL(file); 
    }
  }
}