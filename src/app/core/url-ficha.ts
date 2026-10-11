import { environment } from '../../environments/environment';

export function urlPublicaFicha(codigo: string): string {
  const base = (environment.fichaBaseUrl || window.location.origin).replace(/\/$/, '');
  return `${base}/emergencia/${codigo}`;
}

export function urlImagemQrCode(codigo: string, tamanho = 220): string {
  const destino = encodeURIComponent(urlPublicaFicha(codigo));
  return `https://api.qrserver.com/v1/create-qr-code/?size=${tamanho}x${tamanho}&data=${destino}`;
}
