import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Profissional } from '@core/models';

@Injectable({ providedIn: 'root' })
export class ProfissionalService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/profissionais'; 

  listarTodos(): Observable<Profissional[]> {
    return this.http.get<Profissional[]>(this.apiUrl);
  }

  salvar(profissional: Profissional): Observable<Profissional> {
    return this.http.post<Profissional>(this.apiUrl, profissional);
  }
}