import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ViaCep } from './viacep.service';

/**
 * UC02 - Teste previsto na especificação: quando o ViaCEP não responde, o erro é
 * propagado para que a tela libere o preenchimento manual do endereço.
 */
describe('ViaCep', () => {
  let service: ViaCep;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ViaCep);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('deve consultar o CEP apenas com dígitos', () => {
    service.buscarCep('19800-000').subscribe();

    const req = http.expectOne('https://viacep.com.br/ws/19800000/json/');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('deve devolver a marcação de erro quando o CEP não existe', () => {
    let resposta: any;
    service.buscarCep('00000000').subscribe((dados) => (resposta = dados));

    http.expectOne('https://viacep.com.br/ws/00000000/json/').flush({ erro: true });

    expect(resposta.erro).toBeTrue();
  });

  it('deve propagar a falha quando o serviço está fora do ar', () => {
    let falhou = false;
    service.buscarCep('19800000').subscribe({ error: () => (falhou = true) });

    http.expectOne('https://viacep.com.br/ws/19800000/json/')
      .error(new ProgressEvent('erro de rede'), { status: 0, statusText: 'Unknown Error' });

    expect(falhou).toBeTrue();
  });
});
