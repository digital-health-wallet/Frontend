import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contato } from '@core/models';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class ContatoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiHost}/contatos`;

  listarTodos(): Observable<Contato[]> {
    return this.http.get<Contato[]>(this.apiUrl);
  }

  salvar(contato: Contato): Observable<Contato> {
    if (contato.id) {
      return this.http.put<Contato>(`${this.apiUrl}/${contato.id}`, contato);
    } else {
      return this.http.post<Contato>(this.apiUrl, contato);
    }
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
