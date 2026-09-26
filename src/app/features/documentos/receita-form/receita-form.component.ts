import { Component, Input, Output, EventEmitter, inject, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { DocumentosService } from '../../../core/services/documentos.service';
import { PacienteService } from '../../../core/services/paciente.service';
import { Receita } from '../../../core/models';

interface ItemFormulario {
  id?: number;
  idMedicamento?: number;
  medicacao: string;
  posologia: string;
  usoContinuo: boolean;
}

function novoItem(): ItemFormulario {
  return { medicacao: '', posologia: '', usoContinuo: false };
}

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
  private messageService = inject(MessageService);
  private pacienteService = inject(PacienteService);

  dataReceita = '';
  orientacoes = '';
  carregando = false;

  /** RF09 - uma receita comporta vários medicamentos, cada um com posologia própria. */
  itens: ItemFormulario[] = [novoItem()];
  submetido = false;
  arquivoBase64: string | null = null;
  nomeArquivo = '';

  ngOnChanges(): void {
    if (this.receitaParaEditar) {
      const itens = this.receitaParaEditar.itens ?? [];
      this.itens = itens.length
        ? itens.map(item => ({
            id: item.id,
            idMedicamento: item.medicamento?.id,
            medicacao: item.medicamento?.nomeMedicamento ?? '',
            posologia: item.posologia ?? '',
            usoContinuo: item.usoContinuo ?? false
          }))
        : [novoItem()];
      this.orientacoes = this.receitaParaEditar.orientacoesGerais ?? '';
    }
  }

  adicionarMedicamento(): void {
    this.itens = [...this.itens, novoItem()];
  }

  removerMedicamento(indice: number): void {
    this.itens = this.itens.filter((_, i) => i !== indice);
  }

  salvar(): void {
    this.submetido = true;

    if (this.itens.some(item => !item.medicacao || !item.posologia)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos obrigatórios',
        detail: 'Informe o nome da medicação e a posologia de todos os medicamentos.'
      });
      return;
    }

    this.carregando = true;

    const receita: Receita = {
      idAgendamento: this.receitaParaEditar?.idAgendamento ?? this.idAgendamento,
      idPaciente: this.receitaParaEditar?.idPaciente ?? this.pacienteService.getIdPacienteSelecionado(),
      orientacoesGerais: this.orientacoes,
      uploads: this.arquivoBase64
        ? [{ base64: this.arquivoBase64 }]
        : (this.receitaParaEditar?.uploads ?? []),
      itens: this.itens.map(item => ({
        id: item.id,
        medicamento: { id: item.idMedicamento, nomeMedicamento: item.medicacao },
        posologia: item.posologia,
        usoContinuo: item.usoContinuo
      }))
    };

    const operacao = this.receitaParaEditar?.id
      ? this.documentosService.atualizarReceita(this.receitaParaEditar.id, receita)
      : this.documentosService.salvarReceita(receita);

    operacao.subscribe({
      next: () => {
        this.carregando = false;
        this.submetido = false;
        this.itens = [novoItem()];
        this.orientacoes = '';
        this.aoSalvar.emit();
      },
      error: (erro) => {
        console.error('Erro ao salvar receita:', erro);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro ao salvar',
          detail: erro?.error?.mensagem ?? 'Não foi possível salvar a receita. Tente novamente.'
        });
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
