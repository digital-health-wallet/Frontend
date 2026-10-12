import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Paciente } from '@core/models';
import { AuthService } from '@core/services/auth.service';
import { PacienteService } from '@core/services/paciente.service';

@Component({
  selector: 'app-meus-pacientes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './meus-pacientes.component.html',
  styleUrl: './meus-pacientes.component.scss'
})
export class MeusPacientesComponent implements OnInit {
  private authService = inject(AuthService);
  private pacienteService = inject(PacienteService);
  private router = inject(Router);

  pacientes = signal<Paciente[]>([]);
  cpfNovoPaciente = '';
  erro = signal<string | null>(null);
  carregando = signal(false);

  ngOnInit(): void {
    if (!this.authService.isAutenticado()) {
      this.router.navigate(['/login']);
      return;
    }
    this.carregarPacientes();
  }

  get nomeUsuario(): string {
    return this.authService.getSessao()?.email ?? '';
  }

  carregarPacientes(): void {
    this.pacienteService.listarMeus().subscribe({
      next: (dados) => this.pacientes.set(dados),
      error: (erro) => console.error('Erro ao carregar pacientes:', erro)
    });
  }

  /**
   * Abre o paciente já cadastrado direto na agenda, que é o uso do dia a dia. O
   * formulário do prontuário fica no perfil, pela barra lateral, para quando
   * houver algo a corrigir — repeti-lo a cada acesso não faria sentido.
   */
  gerenciar(paciente: Paciente): void {
    this.pacienteService.selecionarPaciente(paciente);
    this.router.navigate(['/agendamentos']);
  }

  cadastrarPaciente(): void {
    if (!this.cpfNovoPaciente.trim()) {
      this.erro.set('Informe o CPF do paciente.');
      return;
    }

    this.erro.set(null);
    this.router.navigate(['/prontuario'], { queryParams: { cpf: this.cpfNovoPaciente } });
  }

  sair(): void {
    this.authService.logout();
  }
}
