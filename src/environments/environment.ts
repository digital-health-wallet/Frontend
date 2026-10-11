export const environment = {
  production: false,

  // Mesmo host que serviu a página: localhost no PC, IP da rede quando acessado
  // por outro dispositivo. Nunca precisa trocar manualmente.
  apiHost: `${window.location.protocol}//${window.location.hostname}:8080`,

  // Endereço que vai dentro do QR Code da ficha de emergência. Em branco, usa o
  // endereço da própria página — então basta abrir a aplicação pelo IP da máquina
  // na rede (./acessar.sh mostra qual é) para o código já apontar para um
  // endereço que o celular alcança, em qualquer rede e sem reconstruir a imagem.
  // Só precisa ser preenchido quando o endereço público for diferente do que
  // serviu a página, como atrás de um domínio em produção.
  fichaBaseUrl: '',
};
