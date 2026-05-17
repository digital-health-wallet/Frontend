import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-visualizar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visualizar.component.html',
  styleUrl: './visualizar.component.scss'
})
export class VisualizarComponent {
  tabAtiva = signal<'exames' | 'receitas' | 'diagnosticos'>('exames');

  exames = [
    { nome: 'Hemograma Completo', data: '15/04/2025' },
    { nome: 'Tomografia Cardíaca', data: '15/04/2025' },
    { nome: 'Função Renal', data: '15/04/2025' },
  ];
}