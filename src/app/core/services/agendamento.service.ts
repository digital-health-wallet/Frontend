import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AgendamentoResponse {
  id: number;
  idPaciente: number;
  especialidade: string;
  nomeClinica: string;
  motivoConsulta: string;
  tipoConsulta: string;
  dataAgendamento: string;
  horaAgendamento: string;
  horaFim: string;
  status: string;
  favorito: boolean;
  arquivado: boolean;
}

export interface AgendamentoRequest {
  idPaciente: number;
  especialidade: string;
  nomeClinica: string;
  motivoConsulta?: string;
  tipoConsulta?: string;
  dataAgendamento: string;
  horaAgendamento: string;
  horaFim?: string;
}

@Injectable({ providedIn: 'root' })
export class AgendamentoService {

  private readonly API = 'http://localhost:8080/api/agendamentos';

  constructor(private http: HttpClient) {}

  listarAtivos(idPaciente: number): Observable<AgendamentoResponse[]> {
    return this.http.get<AgendamentoResponse[]>(`${this.API}/paciente/${idPaciente}`);
  }

  listarArquivados(idPaciente: number): Observable<AgendamentoResponse[]> {
    return this.http.get<AgendamentoResponse[]>(`${this.API}/paciente/${idPaciente}/arquivados`);
  }

  criar(request: AgendamentoRequest): Observable<AgendamentoResponse> {
    return this.http.post<AgendamentoResponse>(this.API, request);
  }

  atualizarStatus(id: number, status: string): Observable<AgendamentoResponse> {
    return this.http.patch<AgendamentoResponse>(`${this.API}/${id}/status?status=${status}`, {});
  }

  arquivar(id: number): Observable<AgendamentoResponse> {
    return this.http.patch<AgendamentoResponse>(`${this.API}/${id}/arquivar`, {});
  }

  toggleFavorito(id: number): Observable<AgendamentoResponse> {
    return this.http.patch<AgendamentoResponse>(`${this.API}/${id}/favorito`, {});
  }
}