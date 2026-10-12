import { environment } from '../../environments/environment';

/**
 * Endereço público informado em tempo de execução pelo config.json, que o
 * ./rodar.sh gera com o IP da máquina na rede e entrega ao nginx.
 */
let baseEmTempoDeExecucao: string | null = null;

export function definirBaseFicha(base: string | null | undefined): void {
  baseEmTempoDeExecucao = base?.trim() ? base.trim() : null;
}

/**
 * Monta o endereço completo da ficha de emergência que vai dentro do QR Code.
 *
 * A ordem importa: o config.json vem primeiro porque o endereço da página não
 * serve — abrindo a aplicação por "localhost", o código apontaria para
 * "localhost", que no celular é o próprio celular, e a ficha não abriria. O
 * environment cobre o caso de um domínio fixo em produção, e o endereço da
 * página é o último recurso.
 */
export function urlPublicaFicha(codigo: string): string {
  const base = (baseEmTempoDeExecucao || environment.fichaBaseUrl || window.location.origin)
      .replace(/\/$/, '');
  return `${base}/emergencia/${codigo}`;
}

/** Endereço da imagem do QR Code para um código de emergência. */
export function urlImagemQrCode(codigo: string, tamanho = 220): string {
  const destino = encodeURIComponent(urlPublicaFicha(codigo));
  return `https://api.qrserver.com/v1/create-qr-code/?size=${tamanho}x${tamanho}&data=${destino}`;
}
