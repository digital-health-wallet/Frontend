// Usa o mesmo host que serviu a página (localhost no PC, IP da rede quando acessado
// por outro dispositivo, ex.: celular lendo QR code) — nunca precisa trocar manualmente.
export const environment = {
  production: false,
  apiHost: `${window.location.protocol}//${window.location.hostname}:8080`,
};
