import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-google-callback',
  standalone: true,
  template: `<div class="google-callback">Entrando...</div>`,
  styles: [`
    .google-callback {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
    }
  `]
})
export class GoogleCallbackComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const token = params.get('token');
    const idUsuario = params.get('idUsuario');
    const calendarConectado = params.get('calendarConectado') === 'true';

    if (!token || !idUsuario) {
      this.router.navigate(['/login']);
      return;
    }

    this.authService.processarRetornoGoogle(token, Number(idUsuario), calendarConectado);
    this.router.navigate(['/meus-pacientes']);
  }
}
