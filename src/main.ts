import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { definirBaseFicha } from './app/core/url-ficha';

fetch('config.json', { cache: 'no-store' })
  .then((resposta) => (resposta.ok ? resposta.json() : null))
  .then((config) => definirBaseFicha(config?.fichaBaseUrl))
  .catch(() => definirBaseFicha(null))
  .finally(() => {
    bootstrapApplication(AppComponent, appConfig)
      .catch((err) => console.error(err));
  });
