import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Diagnostico, Exame, Receita } from '../models';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentosService {
  private apiUrl = `${environment.apiHost}/api`;

  constructor(private http: HttpClient) {}

  salvarDiagnostico(diagnostico: Diagnostico): Observable<Diagnostico> {
    return this.http.post<Diagnostico>(`${this.apiUrl}/diagnosticos`, diagnostico);
  }

  salvarExame(exame: Exame): Observable<Exame> {
    return this.http.post<Exame>(`${this.apiUrl}/exames`, exame);
  }

  salvarReceita(receita: Receita): Observable<Receita> {
    return this.http.post<Receita>(`${this.apiUrl}/receitas`, receita);
  }

  buscarExamesPorAgendamento(idAgendamento: number): Observable<Exame[]> {
    return this.http.get<Exame[]>(`${this.apiUrl}/exames/agendamento/${idAgendamento}`);
  }

  buscarReceitasPorAgendamento(idAgendamento: number): Observable<Receita[]> {
    return this.http.get<Receita[]>(`${this.apiUrl}/receitas/agendamento/${idAgendamento}`);
  }

  buscarDiagnosticosPorAgendamento(idAgendamento: number): Observable<Diagnostico[]> {
    return this.http.get<Diagnostico[]>(`${this.apiUrl}/diagnosticos/agendamento/${idAgendamento}`);
  }

  listarExamesGerais(idPaciente: number): Observable<Exame[]> {
    return this.http.get<Exame[]>(`${this.apiUrl}/exames/paciente/${idPaciente}`);
  }

  listarReceitasGerais(idPaciente: number): Observable<Receita[]> {
    return this.http.get<Receita[]>(`${this.apiUrl}/receitas/paciente/${idPaciente}`);
  }

  listarDiagnosticosGerais(idPaciente: number): Observable<Diagnostico[]> {
    return this.http.get<Diagnostico[]>(`${this.apiUrl}/diagnosticos/paciente/${idPaciente}`);
  }

  atualizarExame(id: number, exame: Exame): Observable<Exame> {
    return this.http.put<Exame>(`${this.apiUrl}/exames/${id}`, exame);
  }

  atualizarReceita(id: number, receita: Receita): Observable<Receita> {
    return this.http.put<Receita>(`${this.apiUrl}/receitas/${id}`, receita);
  }

  atualizarDiagnostico(id: number, diagnostico: Diagnostico): Observable<Diagnostico> {
    return this.http.put<Diagnostico>(`${this.apiUrl}/diagnosticos/${id}`, diagnostico);
  }

  excluirExame(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/exames/${id}`);
  }

  excluirReceita(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/receitas/${id}`);
  }

  excluirDiagnostico(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/diagnosticos/${id}`);
  }
}