import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Profissional } from '@core/models';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class ProfissionalService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiHost}/profissionais`;

  listarTodos(): Observable<Profissional[]> {
    return this.http.get<Profissional[]>(this.apiUrl);
  }

  salvar(profissional: Profissional): Observable<Profissional> {
    if (profissional.id) {
      return this.http.put<any>(`${this.apiUrl}/${profissional.id}`, profissional);
    } else {
      return this.http.post<any>(this.apiUrl, profissional);
    }
  }
}