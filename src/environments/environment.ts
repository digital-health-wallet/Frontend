// Usa o mesmo host que serviu a página (localhost no PC, IP da rede quando acessado
// por outro dispositivo, ex.: celular lendo QR code) — nunca precisa trocar manualmente.
export const environment = {
  production: false,
  apiHost: `${window.location.protocol}//${window.location.hostname}:8080`,

  // Endereço que vai dentro do QR Code da ficha de emergência. Em "localhost" o
  // código só abriria no próprio computador, porque "localhost" no celular é o
  // próprio celular. Preenchendo com o IP da máquina na rede local (ex.:
  // http://192.168.15.8), o QR passa a apontar para um endereço que o celular
  // alcança. Em branco, usa o endereço da própria página.
  fichaBaseUrl: 'http://192.168.15.8',
};
