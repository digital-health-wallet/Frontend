import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmergenciaResponse } from '@core/models';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class EmergenciaService {
  private http = inject(HttpClient);
  private readonly API = `${environment.apiHost}/api/emergencia`;

  buscarFicha(codigo: string): Observable<EmergenciaResponse> {
    return this.http.get<EmergenciaResponse>(`${this.API}/${codigo}`);
  }
}
