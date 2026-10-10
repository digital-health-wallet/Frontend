import { environment } from '../../environments/environment';

/**
 * Monta o endereço completo da ficha de emergência que vai dentro do QR Code.
 *
 * Prefere o `fichaBaseUrl` configurado no environment, porque o endereço da
 * página ("localhost", durante o desenvolvimento) não é alcançável pelo celular
 * que lê o código. Sem essa configuração, cai no endereço da própria página.
 */
export function urlPublicaFicha(codigo: string): string {
  const base = (environment.fichaBaseUrl || window.location.origin).replace(/\/$/, '');
  return `${base}/emergencia/${codigo}`;
}

/** Endereço da imagem do QR Code para um código de emergência. */
export function urlImagemQrCode(codigo: string, tamanho = 220): string {
  const destino = encodeURIComponent(urlPublicaFicha(codigo));
  return `https://api.qrserver.com/v1/create-qr-code/?size=${tamanho}x${tamanho}&data=${destino}`;
}
