import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '@core/services/auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken', 'logout']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('deve anexar o token nas requisições quando o usuário está autenticado', () => {
    authServiceSpy.getToken.and.returnValue('token-abc');

    http.get('/api/teste').subscribe();

    const req = httpMock.expectOne('/api/teste');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-abc');
    req.flush({});
  });

  it('não deve anexar cabeçalho quando não há token', () => {
    authServiceSpy.getToken.and.returnValue(null);

    http.get('/api/teste').subscribe();

    const req = httpMock.expectOne('/api/teste');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('deve deslogar quando o backend rejeita a sessão (401)', () => {
    authServiceSpy.getToken.and.returnValue('token-expirado');

    http.get('/api/teste').subscribe({ error: () => {} });

    httpMock.expectOne('/api/teste').flush('nao autorizado', { status: 401, statusText: 'Unauthorized' });

    expect(authServiceSpy.logout).toHaveBeenCalled();
  });

  it('não deve deslogar em erros que não são de sessão (500)', () => {
    authServiceSpy.getToken.and.returnValue('token-valido');

    http.get('/api/teste').subscribe({ error: () => {} });

    httpMock.expectOne('/api/teste').flush('erro', { status: 500, statusText: 'Server Error' });

    expect(authServiceSpy.logout).not.toHaveBeenCalled();
  });
});
