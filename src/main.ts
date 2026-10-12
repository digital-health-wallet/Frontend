import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { definirBaseFicha } from './app/core/url-ficha';

/**
 * Lê o config.json antes de subir a aplicação. É ele que informa o endereço
 * público usado no QR Code da ficha de emergência, gerado pelo ./rodar.sh com o
 * IP da máquina na rede. Ausente ou inválido, a aplicação sobe do mesmo jeito e
 * o endereço cai para o da própria página.
 */
fetch('config.json', { cache: 'no-store' })
  .then((resposta) => (resposta.ok ? resposta.json() : null))
  .then((config) => definirBaseFicha(config?.fichaBaseUrl))
  .catch(() => definirBaseFicha(null))
  .finally(() => {
    bootstrapApplication(AppComponent, appConfig)
      .catch((err) => console.error(err));
  });
