import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PacienteService } from '@core/services/paciente.service';

export const pacienteGuard: CanActivateFn = () => {
  if (inject(PacienteService).getIdPacienteSelecionado() !== null) {
    return true;
  }

  inject(Router).navigate(['/meus-pacientes']);
  return false;
};
