import { Component, Input, Output, EventEmitter, inject, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DocumentosService } from '../../../core/services/documentos.service';
import { PacienteService } from '../../../core/services/paciente.service';
import { Exame } from '../../../core/models';

@Component({
  selector: 'app-exame-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule],
  templateUrl: './exame-form.component.html',
  styleUrl: './exame-form.component.scss'
})
export class ExameFormComponent implements OnChanges {
  // Opcional: pode ser nulo se for inserido direto na aba de Documentos Avulsos
  @Input() idAgendamento?: number | null = null;
  @Input() exameParaEditar: Exame | null = null;
  @Output() aoSalvar = new EventEmitter<void>();

  private documentosService = inject(DocumentosService);
  private pacienteService = inject(PacienteService);

  nomeExame = '';
  dataExame = '';
  observacoes = '';
  carregando = false;

  arquivoBase64: string | null = null;
  nomeArquivo = '';

  ngOnChanges(): void {
    if (this.exameParaEditar) {
      this.nomeExame = this.exameParaEditar.nomeExame;
      this.dataExame = this.exameParaEditar.dataHoraExame ?? '';
      this.observacoes = this.exameParaEditar.observacoes ?? '';
    }
  }

  salvar(): void {
    if (!this.nomeExame || !this.dataExame) {
      alert('Preencha o nome e a data do exame!');
      return;
    }

    this.carregando = true;

    const exame: Exame = {
      idAgendamento: this.exameParaEditar?.idAgendamento ?? this.idAgendamento,
      idPaciente: this.exameParaEditar?.idPaciente ?? this.pacienteService.getIdPacienteSelecionado(),
      nomeExame: this.nomeExame,
      dataHoraExame: this.dataExame,
      observacoes: this.observacoes,
      uploads: this.arquivoBase64
        ? [{ base64: this.arquivoBase64 }]
        : (this.exameParaEditar?.uploads ?? [])
    };

    const operacao = this.exameParaEditar?.id
      ? this.documentosService.atualizarExame(this.exameParaEditar.id, exame)
      : this.documentosService.salvarExame(exame);

    operacao.subscribe({
      next: () => {
        this.carregando = false;

        this.nomeExame = '';
        this.dataExame = '';
        this.observacoes = '';

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
        this.arquivoBase64 = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
}
