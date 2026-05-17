import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-exame-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule],
  templateUrl: './exame-form.component.html',
  styleUrl: './exame-form.component.scss'
})
export class ExameFormComponent {
  nomeExame = '';
  dataExame = '';
  observacoes = '';

  salvar(): void { 
    console.log('Salvando exame...'); 
  }
}