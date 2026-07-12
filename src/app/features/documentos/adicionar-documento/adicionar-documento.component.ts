import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

import { DialogModule } from 'primeng/dialog';
import { DiagnosticoFormComponent } from '../diagnostico-form/diagnostico-form.component';
import { ReceitaFormComponent } from '../receita-form/receita-form.component';
import { ExameFormComponent } from '../exame-form/exame-form.component'; 

@Component({
  selector: 'app-adicionar-documento',
  standalone: true,
  imports: [CommonModule, RouterLink, DialogModule, DiagnosticoFormComponent, ReceitaFormComponent, ExameFormComponent], 
  templateUrl: './adicionar-documento.component.html',
  styleUrl: './adicionar-documento.component.scss'
})
export class AdicionarDocumentoComponent implements OnInit {
  private route = inject(ActivatedRoute);

  isContextoAgendamento = false;
  tituloDaPagina = 'Documentos';
  idAgendamento: number | undefined; 

  
  modalDiagnosticoAberto = signal(false);
  modalReceitaAberta = signal(false); 
  modalExameAberto = signal(false);

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.idAgendamento = Number(idParam); 
      this.isContextoAgendamento = true;
      this.tituloDaPagina = `Agendamento - ID ${this.idAgendamento}`; 
    }
  }

  abrirModalExame() {
    this.modalExameAberto.set(true);
  }

  abrirModalReceita() {
    this.modalReceitaAberta.set(true);
  }

  abrirModalDiagnostico() {
    this.modalDiagnosticoAberto.set(true);
  }

  fecharModais() {
    this.modalDiagnosticoAberto.set(false);
    this.modalReceitaAberta.set(false);
    this.modalExameAberto.set(false);
  }
}