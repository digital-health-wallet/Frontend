import { Component, Input, Output, EventEmitter, inject, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DocumentosService } from '../../../core/services/documentos.service';
import { PacienteService } from '../../../core/services/paciente.service';
import { Receita } from '../../../core/models';

@Component({
  selector: 'app-receita-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule],
  templateUrl: './receita-form.component.html',
  styleUrl: './receita-form.component.scss'
})
export class ReceitaFormComponent implements OnChanges {
  @Input() idAgendamento!: number;
  @Input() receitaParaEditar: Receita | null = null;

  @Output() aoSalvar = new EventEmitter<void>();

  private documentosService = inject(DocumentosService);
  private pacienteService = inject(PacienteService);

  dataReceita = '';
  medicacao = '';
  posologia = '';
  orientacoes = '';
  usoContinuo = false;
  carregando = false;
  arquivoBase64: string | null = null;
  nomeArquivo = '';

  ngOnChanges(): void {
    if (this.receitaParaEditar) {
      const item = this.receitaParaEditar.itens?.[0];
      this.medicacao = item?.medicamento?.nomeMedicamento ?? '';
      this.posologia = item?.posologia ?? '';
      this.usoContinuo = item?.usoContinuo ?? false;
      this.orientacoes = this.receitaParaEditar.orientacoesGerais ?? '';
    }
  }

  salvar(): void {
    if (!this.medicacao || !this.posologia) {
      alert('Preencha a medicação e a posologia!');
      return;
    }

    this.carregando = true;

    const itemExistente = this.receitaParaEditar?.itens?.[0];

    const receita: Receita = {
      idAgendamento: this.receitaParaEditar?.idAgendamento ?? this.idAgendamento,
      idPaciente: this.receitaParaEditar?.idPaciente ?? this.pacienteService.getIdPacienteSelecionado(),
      orientacoesGerais: this.orientacoes,
      uploads: this.arquivoBase64
        ? [{ base64: this.arquivoBase64 }]
        : (this.receitaParaEditar?.uploads ?? []),
      itens: [
        {
          id: itemExistente?.id,
          medicamento: { id: itemExistente?.medicamento?.id, nomeMedicamento: this.medicacao },
          posologia: this.posologia,
          usoContinuo: this.usoContinuo
        }
      ]
    };

    const operacao = this.receitaParaEditar?.id
      ? this.documentosService.atualizarReceita(this.receitaParaEditar.id, receita)
      : this.documentosService.salvarReceita(receita);

    operacao.subscribe({
      next: () => {
        this.carregando = false;
        this.medicacao = '';
        this.posologia = '';
        this.orientacoes = '';
        this.usoContinuo = false;
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
