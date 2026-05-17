import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-adicionar-documento',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './adicionar-documento.component.html',
  styleUrl: './adicionar-documento.component.scss'
})
export class AdicionarDocumentoComponent implements OnInit {
  private route = inject(ActivatedRoute);

  isContextoAgendamento = false;
  tituloDaPagina = 'Documentos';
  
  ngOnInit() {
    const idAgendamento = this.route.snapshot.paramMap.get('id');

    if (idAgendamento) {
      this.isContextoAgendamento = true;
      this.tituloDaPagina = `Agendamento - ID ${idAgendamento}`; 
    }
  }

  abrirModalExame() {
    console.log('Abrir modal exame');
  }

  abrirModalReceita() {
    console.log('Abrir modal receita');
  }
}