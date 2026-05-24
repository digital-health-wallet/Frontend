// documentos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Diagnostico, Exame, Receita } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DocumentosService {
  private apiUrl = 'http://localhost:8080/api'; 

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
}