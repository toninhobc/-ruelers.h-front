# Projeto: Aplicativo de Alerta e Prevenção de Risco (Front-end)

Este projeto de front-end tem como objetivo criar um aplicativo móvel (ou web responsivo) que permite aos usuários enviar alertas de ocorrências, compartilhar sua localização em tempo real, acionar um botão de pânico e contribuir com imagens. Ele também visa integrar-se com uma API de backend para fornecer análises de risco de crimes baseadas em IA.

---

## Visão Geral e Funcionalidades Principais

* **Geolocalização em Tempo Real:** Obtenção e exibição da localização atual do usuário via GPS.
* **Botão de Pânico:** Um botão de fácil acesso que, ao ser acionado, envia um alerta de emergência com a localização do usuário para contatos pré-definidos ou autoridades (via backend).
* **Envio de Alertas de Ocorrências:** Formulário para o usuário detalhar uma ocorrência (tipo, descrição, etc.) e enviá-la para a API.
* **Upload de Imagens:** Capacidade de anexar fotos às ocorrências, seja tirando uma nova foto ou selecionando da galeria.
* **Mapa Interativo:** Exibição da localização do usuário e, opcionalmente, de alertas próximos em um mapa.
* **Previsão de Risco de Crimes (IA):** Integração com o endpoint da API para exibir a probabilidade de risco de crimes na localização atual do usuário ou em uma área específica.

---

## Tecnologias Recomendadas

Para este tipo de aplicação, **Next Js** é altamente recomendado por sua capacidade de criar aplicações a partir de uma única base de código, com acesso robusto a recursos nativos como GPS e câmera.

* **Framework:** **Next js**
* **Mapas:** `open-street-maps` (para integração com localização)
* **Geolocalização:** `nominatin para referenciamento em lugares reais utilizando coordenadas`
* **Requisições HTTP:** `Axios`
* **Navegação:** `React Navigation`

---

## Primeiros Passos

Siga estas instruções para configurar e executar o aplicativo front-end localmente.

### Instalação

1.  Clone este repositório:
    ```bash
    git clone [https://github.com/seu-usuario/seu-projeto-frontend.git](https://github.com/seu-usuario/seu-projeto-frontend.git)
    cd seu-projeto-frontend
    ```
2.  Instale as dependências:
    ```bash
    npm install
    # ou
    # yarn install
    ```

### Variáveis de Ambiente (Opcional, mas Recomendado)

Se a sua API de backend estiver hospedada em outro lugar que não seja `http://localhost:5002` (como será em produção), crie um arquivo `.env` na raiz do seu projeto
