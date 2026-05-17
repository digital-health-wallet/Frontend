import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-receita-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './receita-form.component.html',
  styleUrl: './receita-form.component.scss'
})
export class ReceitaFormComponent {
  dataReceita = '';
  medicacao = '';
  posologia = '';

  salvar(): void { 
    console.log('Salvando receita...'); 
  }
}