import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PacienteService } from '../../../core/services/paciente.service';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {

  private readonly authService = inject(AuthService);
  private readonly pacienteService = inject(PacienteService);

  nomeExibido: string = 'Nome';

  ngOnInit(): void {
    this.pacienteService.nomePaciente$.subscribe((novoNome) => {
      this.nomeExibido = novoNome;
    });

    const idPaciente = this.pacienteService.getIdPacienteSelecionado();
    if (idPaciente) {
      this.pacienteService.buscarPorId(idPaciente).subscribe({
        next: (paciente) => this.pacienteService.atualizarNomeNaSidebar(paciente.nome),
        error: () => {}
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
