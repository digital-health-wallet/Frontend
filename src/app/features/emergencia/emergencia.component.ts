import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { EmergenciaService } from '@core/services/emergencia.service';
import { EmergenciaResponse } from '@core/models';

@Component({
  selector: 'app-emergencia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './emergencia.component.html',
  styleUrl: './emergencia.component.scss'
})
export class EmergenciaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private emergenciaService = inject(EmergenciaService);

  ficha = signal<EmergenciaResponse | null>(null);
  carregando = signal(true);

  ngOnInit(): void {
    const codigo = this.route.snapshot.paramMap.get('codigo');

    if (!codigo) {
      this.carregando.set(false);
      return;
    }

    this.emergenciaService.buscarFicha(codigo).subscribe({
      next: (ficha) => {
        this.ficha.set(ficha);
        this.carregando.set(false);
      },
      error: (err) => {
        console.error('Erro ao buscar ficha de emergência:', err);
        this.carregando.set(false);
      }
    });
  }
}
