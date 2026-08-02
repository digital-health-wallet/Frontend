import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '@env/environment';

export interface AuthResponse {
  token: string;
  idUsuario: number;
  email: string;
  calendarConectado: boolean;
}

export interface SessaoUsuario {
  idUsuario: number;
  email: string;
  calendarConectado: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly API = `${environment.apiHost}/api/auth`;

  solicitarOtp(email: string): Observable<void> {
    return this.http.post<void>(`${this.API}/otp/solicitar`, { email });
  }

  verificarOtp(email: string, codigo: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/otp/verificar`, { email, codigo }).pipe(
      tap((resposta) =>
        this.persistirSessao(resposta.token, resposta.idUsuario, resposta.email, resposta.calendarConectado)
      )
    );
  }

  // Envia o JWT atual em "state" para o backend vincular o Calendar à conta já logada em vez de criar uma nova.
  iniciarLoginGoogle(): void {
    const state = this.getToken();
    const query = state ? `?state=${encodeURIComponent(state)}` : '';

    this.http.get<{ url: string }>(`${this.API}/google/url${query}`).subscribe({
      next: ({ url }) => (window.location.href = url),
      error: (err) => console.error('Erro ao iniciar login com Google:', err)
    });
  }

  processarRetornoGoogle(token: string, idUsuario: number, calendarConectado: boolean): void {
    const email = this.extrairEmailDoToken(token);
    this.persistirSessao(token, idUsuario, email, calendarConectado);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('sessao');
    localStorage.removeItem('idPaciente');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getSessao(): SessaoUsuario | null {
    const sessao = localStorage.getItem('sessao');
    return sessao ? JSON.parse(sessao) : null;
  }

  getUsuarioId(): number | null {
    return this.getSessao()?.idUsuario ?? null;
  }

  isAutenticado(): boolean {
    return !!this.getToken();
  }

  private persistirSessao(token: string, idUsuario: number, email: string, calendarConectado: boolean): void {
    localStorage.setItem('token', token);
    localStorage.setItem('sessao', JSON.stringify({ idUsuario, email, calendarConectado } satisfies SessaoUsuario));
  }

  private extrairEmailDoToken(token: string): string {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.email ?? '';
    } catch {
      return '';
    }
  }
}
