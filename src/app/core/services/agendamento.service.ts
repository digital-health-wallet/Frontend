import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AgendamentoResponse {
  id: number;
  idPaciente: number;
  idProfissional?: number;
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

export interface ProfissionalRequest {
  nomeProfissional?: string;
  especialidade?: string;
  contato?: string;
  nomeClinica?: string;
  email?: string;
  numeroIdentificacaoProfissional?: string;
}

export interface AgendamentoRequest {
  idPaciente: number;
  idProfissional?: number;
  profissional?: ProfissionalRequest | null;
  especialidade: string;
  nomeClinica?: string;
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
  atualizar(id: number, request: AgendamentoRequest): Observable<AgendamentoResponse> {
    return this.http.put<AgendamentoResponse>(`${this.API}/${id}`, request);
  }
  buscarPorId(id: number): Observable<AgendamentoResponse> {
    return this.http.get<AgendamentoResponse>(`${this.API}/${id}`);
  }
  buscarSugestoesGoogle(idPaciente: number, tokenGoogle: string): Observable<any[]> {
    const headers = new HttpHeaders().set('Google-Token', tokenGoogle);
    return this.http.post<any[]>(`${this.API}/sincronizar-google/sugestoes?idPaciente=${idPaciente}`, null, { headers });
  }
}