import { environment } from '../../environments/environment';

let baseEmTempoDeExecucao: string | null = null;

export function definirBaseFicha(base: string | null | undefined): void {
  baseEmTempoDeExecucao = base?.trim() ? base.trim() : null;
}

export function urlPublicaFicha(codigo: string): string {
  const base = (baseEmTempoDeExecucao || environment.fichaBaseUrl || window.location.origin)
      .replace(/\/$/, '');
  return `${base}/emergencia/${codigo}`;
}

export function urlImagemQrCode(codigo: string, tamanho = 220): string {
  const destino = encodeURIComponent(urlPublicaFicha(codigo));
  return `https://api.qrserver.com/v1/create-qr-code/?size=${tamanho}x${tamanho}&data=${destino}`;
}
