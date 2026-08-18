# Health Wallet - Gestão Clínica 🏥

Este projeto foi desenvolvido utilizando uma arquitetura Clean com **Spring Boot (Java)** no backend e **Angular** no frontend. O banco de dados utilizado é o **H2 Database** (embarcado), gerenciado via Flyway.

Para facilitar a avaliação e a execução em qualquer ambiente, a aplicação está completamente containerizada.

## Pré-requisitos

Para rodar o projeto, você precisa ter apenas uma das seguintes ferramentas instaladas na sua máquina:
- [Podman](https://podman.io/) e [Podman Compose](https://github.com/containers/podman-compose)
- OU [Docker](https://www.docker.com/) e Docker Compose

*Nenhum SDK do Java, Node.js ou servidor de banco de dados precisa ser instalado localmente.*

## Como Executar 🚀

1. Crie uma pasta vazia no seu computador para agrupar o projeto (ex: `tcc-health-wallet`) e abra o terminal dentro dela.

2. Clone os dois repositórios na branch `develop`, garantindo que as pastas sejam nomeadas corretamente:

```bash
git clone -b develop https://github.com/digital-health-wallet/Backend Backend
git clone -b develop https://github.com/digital-health-wallet/Frontend Frontend
```

3. Na mesma pasta raiz onde ficaram as pastas `Backend` e `Frontend`, crie um arquivo chamado `compose.yaml` e cole o conteúdo abaixo:

```yaml
services:
  backend:
    build:
      context: ./Backend
    env_file:
      - ./Backend/.env
    environment:
      FRONTEND_GOOGLE_CALLBACK_URL: http://localhost/auth/google/callback
    ports:
      - "8080:8080"
    restart: unless-stopped

  frontend:
    build:
      context: ./Frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

4. Crie um arquivo `Backend/.env` (a partir do `Backend/.env.example`) com as credenciais OAuth do Google Cloud Console (Client ID e Client Secret). Sem isso, a integração com o Google Calendar (RF06) fica indisponível — o restante da aplicação funciona normalmente.

```bash
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret
```

> Se a máquina estiver em uma rede diferente da que o `Frontend/src/environments/environment.ts` foi configurado, atualize o `apiHost` lá para o IP atual antes de buildar o frontend.

5. No terminal, execute o seguinte comando para construir e iniciar os contêineres:

### Usando Podman:
```bash
podman-compose up -d --build
```

### Usando Docker:
```bash
docker compose up -d --build
```

6. Aguarde o processo de build (pode levar alguns minutos na primeira vez, pois ele fará o download das dependências do Maven e do NPM).
7. Assim que os contêineres estiverem em execução (`Up`), a aplicação estará pronta para uso.

## Acessando a Aplicação 🌐

- **Frontend (Interface do Usuário):** [http://localhost](http://localhost)
- **Backend (API REST):** [http://localhost:8080/api](http://localhost:8080/api)
- **Console do Banco H2:** Acessível via [http://localhost:8080/h2-console](http://localhost:8080/h2-console) (Verifique o `application.properties` para credenciais, se necessário).

## Como Parar a Aplicação 🛑

Para interromper os contêineres e liberar as portas da sua máquina, execute:

```bash
podman-compose down
# ou docker compose down
```
