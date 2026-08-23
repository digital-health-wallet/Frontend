import { Component, Input, Output, EventEmitter, inject, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DocumentosService } from '../../../core/services/documentos.service';
import { PacienteService } from '../../../core/services/paciente.service';
import { Diagnostico } from '../../../core/models';

@Component({
  selector: 'app-diagnostico-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule],
  templateUrl: './diagnostico-form.component.html',
  styleUrl: './diagnostico-form.component.scss'
})
export class DiagnosticoFormComponent implements OnChanges {
  @Input() idAgendamento?: number | null;
  @Input() diagnosticoParaEditar: Diagnostico | null = null;
  @Output() aoSalvar = new EventEmitter<void>();

  private documentosService = inject(DocumentosService);
  private pacienteService = inject(PacienteService);

  nome = '';
  cid = '';
  descricao = '';
  doencaCronica = false;
  carregando = false;

  ngOnChanges(): void {
    if (this.diagnosticoParaEditar) {
      this.nome = this.diagnosticoParaEditar.nome;
      this.cid = this.diagnosticoParaEditar.cid ?? '';
      this.descricao = this.diagnosticoParaEditar.descricao ?? '';
      this.doencaCronica = this.diagnosticoParaEditar.doencaCronica ?? false;
    }
  }

  salvar(): void {
    if (!this.nome) {
      alert('O nome do diagnóstico é obrigatório!');
      return;
    }

    this.carregando = true;

    const diagnostico: Diagnostico = {
      idAgendamento: this.diagnosticoParaEditar?.idAgendamento ?? this.idAgendamento,
      idPaciente: this.diagnosticoParaEditar?.idPaciente ?? this.pacienteService.getIdPacienteSelecionado(),
      nome: this.nome,
      cid: this.cid,
      descricao: this.descricao,
      doencaCronica: this.doencaCronica
    };

    const operacao = this.diagnosticoParaEditar?.id
      ? this.documentosService.atualizarDiagnostico(this.diagnosticoParaEditar.id, diagnostico)
      : this.documentosService.salvarDiagnostico(diagnostico);

    operacao.subscribe({
      next: () => {
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
