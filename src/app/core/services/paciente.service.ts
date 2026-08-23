import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { CadastroProntuarioRequest, PacienteUpdateRequest, PacienteResponse, MedicamentoContinuoRequest } from '@core/models';
import { Paciente } from '@core/models';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private apiUrl = `${environment.apiHost}/api/pacientes`;

  private nomePacienteSource = new BehaviorSubject<string>('Nome'); 
  nomePaciente$ = this.nomePacienteSource.asObservable();

  constructor(private http: HttpClient) {}

  atualizarNomeNaSidebar(novoNome: string) {
    this.nomePacienteSource.next(novoNome);
  }

  salvarProntuarioCompleto(request: CadastroProntuarioRequest): Observable<PacienteResponse> {
    return this.http.post<PacienteResponse>(`${this.apiUrl}/prontuario`, request);
  }

  listarMeus(): Observable<Paciente[]> {
    return this.http.get<Paciente[]>(`${this.apiUrl}/meus`);
  }

  buscarPorId(id: number): Observable<PacienteResponse> {
    return this.http.get<PacienteResponse>(`${this.apiUrl}/${id}`);
  }

  atualizar(id: number, request: PacienteUpdateRequest): Observable<PacienteResponse> {
    return this.http.put<PacienteResponse>(`${this.apiUrl}/${id}`, request);
  }

  inativar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/inativar`, {});
  }

  adicionarMedicamentosContinuos(id: number, medicamentos: MedicamentoContinuoRequest[]): Observable<PacienteResponse> {
    return this.http.post<PacienteResponse>(`${this.apiUrl}/${id}/medicamentos-continuos`, medicamentos);
  }

  selecionarPaciente(paciente: Paciente): void {
    if (paciente.id) {
      localStorage.setItem('idPaciente', String(paciente.id));
    }
    this.atualizarNomeNaSidebar(paciente.nome);
  }

  getIdPacienteSelecionado(): number | null {
    const id = localStorage.getItem('idPaciente');
    return id ? Number(id) : null;
  }
}