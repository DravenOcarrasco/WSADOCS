Aqui está o guia completo em Markdown, incluindo a explicação sobre os comandos de CLI no `index.js` e mencionando que as funções terão documentação de retorno:

---

# Guia de Criação de uma Extensão no WSAction

Este guia explica como criar uma extensão no WSAction e descreve a estrutura de arquivos da extensão, com ênfase no registro de comandos CLI no `index.js`.

## Sumário

1. [Introdução](#introdução)
2. [Como Criar uma Extensão](#como-criar-uma-extensão)
   - [Usando o Executável WSAction](#usando-o-executável-wsaction)
   - [Usando o Atalho WSAction](#usando-o-atalho-wsaction)
3. [Estrutura de Arquivos da Extensão](#estrutura-de-arquivos-da-extensão)
   - [`client.js`](#clientjs)
   - [`index.js`](#indexjs)
   - [`meta.json`](#metajson)
4. [Comandos de CLI no `index.js`](#comandos-de-cli-no-indexjs)

---

## Introdução

O WSAction permite a criação de extensões personalizadas, que interagem com o cliente (navegador) e o servidor (Node.js). Além disso, você pode registrar comandos de linha de comando (CLI) no lado do servidor para interagir com o WebSocket e controlar a lógica da extensão.

## Como Criar uma Extensão

Há duas formas de criar uma extensão no WSAction:

### Usando o Executável WSAction

1. **Abra o terminal ou prompt de comando**:
   Execute o executável do WSAction com o seguinte comando:

   ```bash
   wsaction.exe create-extension
   ```

2. **Nome da Extensão**:
   O WSAction pedirá para você fornecer o nome da sua extensão. Digite o nome desejado e pressione `Enter`.

3. **Extensão Criada**:
   A extensão será criada na pasta `extensions/nome_da_extensao`, contendo os arquivos necessários: `client.js`, `index.js`, e `meta.json`.

### Usando o Atalho WSAction

Há um atalho que pode ser utilizado para pular a etapa de passar parâmetros:

1. **Clique no atalho "Create Extension"**:
   Esse atalho está localizado na pasta do WSAction.

2. **Nome da Extensão**:
   Você será solicitado a fornecer o nome da extensão.

3. **Extensão Criada**:
   A estrutura da extensão será gerada automaticamente, como no método anterior.

---

## Estrutura de Arquivos da Extensão

Após a criação da extensão, você encontrará três arquivos principais dentro da pasta da extensão:

- **`client.js`**: Script que roda no navegador.
- **`index.js`**: Script que roda no servidor.
- **`meta.json`**: Arquivo de metadados que define as informações da extensão.

### `client.js`

Este script roda no lado do cliente (navegador), lidando com a lógica de comunicação via WebSocket.

#### Exemplo:

```javascript
(async function () {
    const CONTEXT = window.WSACTION.createModuleContext("EXAMPLE");
    const SOCKET = CONTEXT.SOCKET;

    SOCKET.on('connect', () => {
        console.log(`${CONTEXT.MODULE_NAME} conectado ao WebSocket`);
        CONTEXT.ioEmit("join", { MODULE_NAME: CONTEXT.MODULE_NAME });
    });

    CONTEXT.ioEmit('sendMessage', { message: 'Hello WebSocket!' });
    await CONTEXT.register();
})();
```

Esse arquivo conecta-se ao servidor WebSocket e emite eventos como `sendMessage` e `join` quando o cliente é carregado.

### `index.js`

Este arquivo contém a lógica do servidor, incluindo a definição de eventos WebSocket e comandos CLI. Também mencionaremos que as funções terão documentação sobre seus retornos, facilitando o entendimento dos dados processados.

#### Exemplo:

```javascript
/**
 * Módulo da extensão.
 * 
 * @param {import('socket.io').Server} WSIO - Instância do WebSocket IO.
 * @param {import('express').Application} APP - Instância do Express.
 * @param {import('readline').Interface} RL - Instância do Readline.
 * @param {Object} STORAGE - Objeto de armazenamento compartilhado.
 * @param {Object} STORAGE.data - Objeto que contém os dados de armazenamento.
 * @param {Function} STORAGE.save - Função que salva o armazenamento.
 * @param {typeof import('express')} EXPRESS - Classe Express.
 * @param {Array<string>} [WEB_SCRIPTS=['client.js']] - Lista de scripts JavaScript a serem carregados dinamicamente.
 * @param {string} EXTENSION_PATH - Caminho absoluto para a pasta da extensão
 * 
 * @returns {{ start: Function, stop: Function }} - Objeto da extensão com funções `start` e `stop`.
 */
module.exports = (WSIO, APP, RL, STORAGE, EXPRESS, WEB_SCRIPTS = ['client.js'], EXTENSION_PATH = '') => {
    const ENABLED = true;
    const NAME = "EXAMPLE";
    const CLIENT_LINK = `${NAME}/client`;
    var WEB_SCRIPTS = WEB_SCRIPTS;
    var EXTENSION_PATH = EXTENSION_PATH;
    const ROUTER = EXPRESS.Router();

    CONTEXT.KEYBOARD_COMMANDS = {}

    // Definindo os eventos do WebSocket
    const IOEVENTS = {
        "sendMessage": {
            description: "Envio de uma mensagem de texto para o servidor WebSocket.",
            _function: (data) => {
                WSIO.emit(`${NAME}:sendMessage`, { message: data });
            },
            // Retorna uma mensagem de confirmação
            returns: "Objeto contendo o status da mensagem enviada"
        }
    };

    const onInitialize = () => {
        console.log(`${NAME} initialized.`);
    };

    const onError = (error) => {
        console.error(`${NAME} error: ${error.message}`);
    };

    return {
        NAME,
        ROUTER,
        ENABLED,
        IOEVENTS,
        CLIENT_LINK,
        EXTENSION_PATH,
        WEB_SCRIPTS,
        onInitialize,
        onError
    };
};
```

### `meta.json`

Contém as configurações essenciais da extensão, como nome, versão, scripts a serem carregados no navegador, e compatibilidade com versões do WSAction.

#### Exemplo do `meta.json`:

```json
{
    "name": "EXAMPLE",
    "version": "1.0.0",
    "github": "https://github.com/myextension",
    "minVersion": "2.10.0-BETA-1",
    "compatibility": [
        "2.10.0-BETA-1"
    ],
    "id": "172969167245420jiun9x8-TEMP",
    "WEB_SCRIPTS": [
        "client.js"
    ]
}
```

---

## Comandos de CLI no `index.js`

O `index.js` permite definir comandos de CLI usando a instância `readline` (`RL`). Esses comandos podem ser usados para interagir com o servidor diretamente a partir do terminal. Aqui está um exemplo de como os comandos são definidos:

#### Exemplo de comandos CLI:

```javascript
CONTEXT.KEYBOARD_COMMANDS = {
    "exampleCommand": {
        description: "Envia uma mensagem via WebSocket.",
        _function: () => {
            RL.question('Digite uma mensagem para enviar: ', (input) => {
                WSIO.emit(`${NAME}:sendMessage`, { message: input });
            });
        },
        // Retorno esperado: Confirmação da mensagem enviada
        returns: "Objeto contendo o status da mensagem enviada"
    },
};
```

### Como Funciona:

- **`exampleCommand`**: Solicita uma mensagem ao usuário via terminal e envia essa mensagem ao servidor via WebSocket.

Esses comandos são úteis para controlar o comportamento da extensão via terminal, sem precisar editar o código diretamente.

---