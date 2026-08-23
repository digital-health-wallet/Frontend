import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '@core/services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((erro) => {
      // Sessão inválida no backend (ex.: usuário não existe mais): força logout em vez de
      // deixar a tela quebrada com dados de um usuário que não existe mais.
      if (token && (erro.status === 401 || erro.status === 403)) {
        authService.logout();
      }
      return throwError(() => erro);
    })
  );
};
