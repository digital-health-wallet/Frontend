import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CadastroProntuarioRequest } from '@core/models';
import { Paciente } from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private apiUrl = 'http://localhost:8080/api/pacientes';

  constructor(private http: HttpClient) {}

  salvarProntuarioCompleto(request: CadastroProntuarioRequest): Observable<Paciente> {
    return this.http.post<Paciente>(`${this.apiUrl}/prontuario`, request);
  }
}