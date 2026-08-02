import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

export const authGuard: CanActivateFn = () => {
  if (inject(AuthService).isAutenticado()) {
    return true;
  }

  inject(Router).navigate(['/login']);
  return false;
};
