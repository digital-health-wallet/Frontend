import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PacienteService } from './paciente.service';
import { Paciente } from '@core/models';

describe('PacienteService', () => {
  let service: PacienteService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PacienteService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(PacienteService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('deve guardar o paciente selecionado para as demais telas usarem', () => {
    const paciente: Paciente = {
      id: 7,
      idUsuario: 1,
      nome: 'Maria',
      dataNascimento: '1990-01-01',
      fichaEmergencialAtiva: true,
      tipoSanguineo: 'O+'
    };

    service.selecionarPaciente(paciente);

    expect(service.getIdPacienteSelecionado()).toBe(7);
  });

  it('deve retornar null quando nenhum paciente foi selecionado', () => {
    expect(service.getIdPacienteSelecionado()).toBeNull();
  });

  it('deve publicar o nome do paciente para a sidebar', (done) => {
    service.nomePaciente$.subscribe((nome) => {
      if (nome === 'Joana') {
        expect(nome).toBe('Joana');
        done();
      }
    });

    service.atualizarNomeNaSidebar('Joana');
  });

  it('deve enviar os medicamentos de uso contínuo para o paciente informado', () => {
    const medicamentos = [{ nome: 'Losartana 50mg', posologia: '1 comprimido pela manhã' }];

    service.adicionarMedicamentosContinuos(2, medicamentos).subscribe();

    const req = httpMock.expectOne((r) => r.url.endsWith('/api/pacientes/2/medicamentos-continuos'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(medicamentos);
    req.flush({});
  });
});
