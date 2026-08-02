import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  etapa = signal<'email' | 'codigo'>('email');
  email = '';
  codigo = '';
  erro = signal<string | null>(null);
  carregando = signal(false);

  solicitarCodigo(): void {
    if (!this.email) {
      this.erro.set('Informe seu e-mail.');
      return;
    }

    this.erro.set(null);
    this.carregando.set(true);

    this.authService.solicitarOtp(this.email).subscribe({
      next: () => {
        this.carregando.set(false);
        this.etapa.set('codigo');
      },
      error: (err) => {
        console.error('Erro ao solicitar código:', err);
        this.carregando.set(false);
        this.erro.set('Não foi possível enviar o código. Verifique o e-mail informado.');
      }
    });
  }

  confirmarCodigo(): void {
    if (!this.codigo) {
      this.erro.set('Informe o código recebido por e-mail.');
      return;
    }

    this.erro.set(null);
    this.carregando.set(true);

    this.authService.verificarOtp(this.email, this.codigo).subscribe({
      next: () => {
        this.carregando.set(false);
        this.router.navigate(['/meus-pacientes']);
      },
      error: (err) => {
        console.error('Erro ao verificar código:', err);
        this.carregando.set(false);
        this.erro.set('Código inválido ou expirado.');
      }
    });
  }

  voltarParaEmail(): void {
    this.etapa.set('email');
    this.codigo = '';
    this.erro.set(null);
  }

  entrarComGoogle(): void {
    this.authService.iniciarLoginGoogle();
  }
}
