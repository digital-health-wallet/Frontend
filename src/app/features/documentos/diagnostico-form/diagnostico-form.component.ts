import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-diagnostico-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './diagnostico-form.component.html',
  styleUrl: './diagnostico-form.component.scss'
})
export class DiagnosticoFormComponent {
  nome = '';
  cid = '';
  descricao = '';
  doencaCronica = false; 

  salvar(): void { 
    console.log('Salvando diagnóstico...', {
      nome: this.nome,
      cid: this.cid,
      descricao: this.descricao,
      doencaCronica: this.doencaCronica
    }); 
  }
}