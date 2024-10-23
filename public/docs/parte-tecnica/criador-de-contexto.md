# Documentação do Módulo Base WSAction

## Sumário

- [Introdução](#introdução)
- [Visão Geral](#visão-geral)
- [Criação do Contexto do Módulo](#criação-do-contexto-do-módulo)
  - [Função: `createModuleContext`](#função-createmodulecontext)
- [Métodos do Contexto](#métodos-do-contexto)
  - [Comunicação via WebSocket](#comunicação-via-websocket)
    - [`ioEmit(event, data)`](#ioemitevent-data)
  - [Gerenciamento de Armazenamento](#gerenciamento-de-armazenamento)
    - [`setStorage(key, value, isGlobal)`](#setstoragekey-value-isglobal)
    - [`getStorage(key, isGlobal)`](#getstoragekey-isglobal)
    - [`getVariable(variableName, defaultValue, create, isGlobal)`](#getvariablevariablename-defaultvalue-create-isglobal)
    - [`setVariable(variableName, value, isGlobal)`](#setvariablevariablename-value-isglobal)
  - [Manipulação de Menus](#manipulação-de-menus)
    - [`setMenuHandler(handlerFunction)`](#setmenuhandlerhandlerfunction)
    - [`showMenu()`](#showmenu)
  - [Gerenciamento de Dados Customizados](#gerenciamento-de-dados-customizados)
    - [`getCustomData(key)`](#getcustomdatakey)
    - [`setCustomData(key, value)`](#setcustomdatakey-value)
  - [Comunicação de Comandos com o Chrome](#comunicação-de-comandos-com-o-chrome)
    - [`sendChromeCommand(data)`](#sendchromecommanddata)
  - [Registro do Contexto](#registro-do-contexto)
    - [`register(CTXAddons)`](#registerctxaddons)
- [Dependências](#dependências)
- [Conclusão](#conclusão)

---

## Introdução

O **Módulo Base WSAction** serve como uma estrutura fundamental para a criação de contextos de trabalho padronizados dentro das extensões WSAction. Ele fornece um conjunto de funcionalidades, incluindo comunicação via WebSocket, gerenciamento de armazenamento, manipulação de dados customizados e interações de menus, facilitando a integração e interação contínua com o ambiente WSAction.

## Visão Geral

O módulo base está encapsulado na função `createModuleContext`, que inicializa um objeto de contexto contendo vários métodos e propriedades. As extensões utilizam este contexto para interagir com eventos WebSocket, gerenciar armazenamento, manipular dados customizados e criar interfaces de usuário, como menus. Esta abordagem padronizada garante consistência e eficiência entre diferentes extensões.

## Criação do Contexto do Módulo

### Função: `createModuleContext`

```javascript
function createModuleContext(name) { /* ... */ }
```

**Descrição:**

Cria um contexto de módulo com capacidades de WebSocket, armazenamento e dados customizados.

**Parâmetros:**

| **Nome** | **Tipo** | **Descrição**                 |
|----------|----------|-------------------------------|
| `name`   | `string` | O nome do módulo.             |

**Retorna:**

| **Tipo** | **Descrição**                                                                                     |
|----------|---------------------------------------------------------------------------------------------------|
| `object` | Objeto de contexto contendo métodos e propriedades para interagir com WebSocket, armazenamento, dados customizados, etc. |

**Componentes Principais:**

- **MODULE_NAME**: Versão em maiúsculas do nome do módulo.
- **SOCKET**: Conexão WebSocket inicializada usando a configuração global do WSAction.
- **KEYBOARD_COMMANDS**: Array de comandos de teclado padrão.
- **customData**: Objeto para armazenar dados definidos pelo usuário.

**Exemplo de Uso:**

```javascript
const CONTEXT = createModuleContext("EXEMPLO-MODULO");
```

---

## Métodos do Contexto

### Comunicação via WebSocket

#### `ioEmit(event, data)`

```javascript
function ioEmit(event, data) { /* ... */ }
```

**Descrição:**

Emite um evento WebSocket com o prefixo do nome do módulo. Garante que o nome do evento seja formatado como `{MODULE_NAME}.evento`.

**Parâmetros:**

| **Nome** | **Tipo** | **Descrição**                                       |
|----------|----------|-----------------------------------------------------|
| `event`  | `string` | O nome do evento (sem o prefixo do módulo).         |
| `data`   | `object` | Os dados a serem enviados com o evento.             |

**Retorna:**

Nenhum retorno (`void`).

**Exemplo de Uso:**

```javascript
// Emite um evento chamado 'atualizarDados' com os dados fornecidos
CONTEXT.ioEmit('atualizarDados', { usuarioId: 123, status: 'ativo' });
```

---

### Gerenciamento de Armazenamento

#### `setStorage(key, value, isGlobal)`

```javascript
async function setStorage(key, value, isGlobal = false) { /* ... */ }
```

**Descrição:**

Armazena dados no armazenamento específico do módulo ou global.

**Parâmetros:**

| **Nome**   | **Tipo**  | **Descrição**                                                                                  |
|------------|-----------|------------------------------------------------------------------------------------------------|
| `key`      | `string`  | A chave para o valor armazenado.                                                                 |
| `value`    | `any`     | O valor a ser armazenado.                                                                        |
| `isGlobal` | `boolean` | Se `true`, armazena os dados globalmente (compartilhado entre todas as instâncias).             |

**Retorna:**

| **Tipo**          | **Descrição**                                                              |
|-------------------|----------------------------------------------------------------------------|
| `Promise<object>` | O resultado da operação de armazenamento, indicando sucesso ou erro.      |

**Exemplo de Uso:**

```javascript
// Armazena configurações do usuário globalmente
await CONTEXT.setStorage('configUsuario', { tema: 'escuro', notificacoes: true }, true);

// Armazena uma configuração específica do módulo localmente
await CONTEXT.setStorage('preferenciaModulo', { modo: 'compacto' });
```

#### `getStorage(key, isGlobal)`

```javascript
async function getStorage(key, isGlobal = false) { /* ... */ }
```

**Descrição:**

Carrega dados do armazenamento específico do módulo ou global.

**Parâmetros:**

| **Nome**   | **Tipo**  | **Descrição**                                       |
|------------|----------|-----------------------------------------------------|
| `key`      | `string` | A chave para carregar o valor.                      |
| `isGlobal` | `boolean`| Se `true`, carrega os dados do armazenamento global. |

**Retorna:**

| **Tipo**          | **Descrição**                                                                 |
|-------------------|-------------------------------------------------------------------------------|
| `Promise<object>` | O resultado da operação de carregamento, contendo os dados ou erro.         |

**Exemplo de Uso:**

```javascript
// Recupera configurações do usuário globalmente
const configUsuario = await CONTEXT.getStorage('configUsuario', true);

// Recupera uma configuração específica do módulo localmente
const preferenciaModulo = await CONTEXT.getStorage('preferenciaModulo');
```

#### `getVariable(variableName, defaultValue, create, isGlobal)`

```javascript
async function getVariable(variableName, defaultValue, create = false, isGlobal = false) { /* ... */ }
```

**Descrição:**

Recupera uma variável do armazenamento, criando-a com um valor padrão se não existir e se a flag `create` estiver definida.

**Parâmetros:**

| **Nome**         | **Tipo**  | **Descrição**                                                              |
|------------------|-----------|----------------------------------------------------------------------------|
| `variableName`   | `string`  | O nome da variável a ser recuperada.                                       |
| `defaultValue`   | `any`     | O valor padrão a ser armazenado se a variável não existir.                |
| `create`         | `boolean` | Se deve criar a variável se não existir.                                   |
| `isGlobal`       | `boolean` | Se deve armazenar a variável globalmente.                                 |

**Retorna:**

| **Tipo**       | **Descrição**                                        |
|----------------|------------------------------------------------------|
| `Promise<any>` | O valor da variável recuperada ou o valor padrão.    |

**Exemplo de Uso:**

```javascript
// Recupera a preferência de tema do usuário, criando-a com 'claro' se não existir
const tema = await CONTEXT.getVariable('tema', 'claro', true, true);

// Recupera uma variável local sem criar se não existir
const modoExibicao = await CONTEXT.getVariable('modoExibicao', 'normal', false);
```

#### `setVariable(variableName, value, isGlobal)`

```javascript
async function setVariable(variableName, value, isGlobal = false) { /* ... */ }
```

**Descrição:**

Define uma variável no armazenamento.

**Parâmetros:**

| **Nome**         | **Tipo**  | **Descrição**                                       |
|------------------|-----------|-----------------------------------------------------|
| `variableName`   | `string`  | O nome da variável a ser definida.                  |
| `value`          | `any`     | O valor a ser armazenado.                           |
| `isGlobal`       | `boolean` | Se deve armazenar a variável globalmente.            |

**Retorna:**

| **Tipo**        | **Descrição**                              |
|-----------------|--------------------------------------------|
| `Promise<void>` | Resolve quando a variável foi definida.    |

**Exemplo de Uso:**

```javascript
// Define a preferência de tema do usuário como 'escuro' globalmente
await CONTEXT.setVariable('tema', 'escuro', true);

// Define uma variável local específica do módulo
await CONTEXT.setVariable('modoExibicao', 'compacto');
```

---

### Manipulação de Menus

#### `setMenuHandler(handlerFunction)`

```javascript
function setMenuHandler(handlerFunction) { /* ... */ }
```

**Descrição:**

Atribui uma função customizada para manipular interações de menu.

**Parâmetros:**

| **Nome**           | **Tipo**    | **Descrição**                                            |
|--------------------|-------------|----------------------------------------------------------|
| `handlerFunction`  | `function`  | A função a ser atribuída como manipulador de menu.        |

**Retorna:**

Nenhum retorno (`void`).

**Exemplo de Uso:**

```javascript
// Define um manipulador de menu que exibe opções no console
CONTEXT.setMenuHandler((options) => {
    options.forEach(option => {
        console.log(`Opção: ${option.label}`);
        option.action();
    });
});
```

#### `showMenu()`

```javascript
function showMenu() { /* ... */ }
```

**Descrição:**

Exibe um menu utilizando o manipulador de menu atribuído. Este método é chamado sem parâmetros pelo WSAction, solicitando que a extensão abra seu menu.

**Parâmetros:**

Nenhum parâmetro.

**Retorna:**

Nenhum retorno (`void`).

**Exemplo de Uso:**

O `showMenu` é chamado automaticamente pelo WSAction, portanto, não é necessário passar parâmetros ao chamá-lo diretamente. Entretanto, você pode chamar manualmente se necessário:

```javascript
// Exibe o menu com opções definidas previamente
CONTEXT.showMenu();
```

---

### Gerenciamento de Dados Customizados

#### `getCustomData(key)`

```javascript
function getCustomData(key) { /* ... */ }
```

**Descrição:**

Recupera dados customizados armazenados pelo usuário.

**Parâmetros:**

| **Nome** | **Tipo**  | **Descrição**                                        |
|----------|-----------|------------------------------------------------------|
| `key`    | `string`  | A chave para recuperar os dados customizados.        |

**Retorna:**

| **Tipo** | **Descrição**                                                            |
|----------|--------------------------------------------------------------------------|
| `any`    | O valor dos dados customizados ou `undefined` se não estiver definido.  |

**Exemplo de Uso:**

```javascript
// Recupera a preferência de exibição do usuário
const preferenciaExibicao = CONTEXT.getCustomData('preferenciaExibicao');
```

#### `setCustomData(key, value)`

```javascript
function setCustomData(key, value) { /* ... */ }
```

**Descrição:**

Armazena dados customizados sob uma chave especificada.

**Parâmetros:**

| **Nome** | **Tipo** | **Descrição**                                           |
|----------|----------|---------------------------------------------------------|
| `key`    | `string` | A chave para armazenar os dados customizados.           |
| `value`  | `any`    | O valor a ser armazenado.                               |

**Retorna:**

Nenhum retorno (`void`).

**Exemplo de Uso:**

```javascript
// Armazena a preferência de exibição do usuário
CONTEXT.setCustomData('preferenciaExibicao', { modo: 'escuro' });
```

---

### Comunicação de Comandos com o Chrome

#### `sendChromeCommand(data)`

```javascript
function sendChromeCommand(data) { /* ... */ }
```

**Descrição:**

Envia um comando para o ambiente da extensão Chrome via `window.postMessage`.

**Parâmetros:**

| **Nome** | **Tipo** | **Descrição**                                                            |
|----------|----------|--------------------------------------------------------------------------|
| `data`   | `object` | Os dados a serem enviados, que incluirão o nome do módulo.               |

**Retorna:**

Nenhum retorno (`void`).

**Exemplo de Uso:**

```javascript
// Envia um comando para atualizar a extensão Chrome
CONTEXT.sendChromeCommand({ action: 'atualizar', payload: { versao: '1.2.3' } });
```

---

### Registro do Contexto

#### `register(CTXAddons)`

```javascript
async function register(CTXAddons = {}) { /* ... */ }
```

**Descrição:**

Registra o contexto do módulo com o Gerenciador de Contexto do WSAction, permitindo a adição de complementos de contexto.

**Parâmetros:**

| **Nome**      | **Tipo** | **Descrição**                                                         |
|---------------|----------|-----------------------------------------------------------------------|
| `CTXAddons`   | `object` | Propriedades ou métodos adicionais para estender o contexto.         |

**Retorna:**

| **Tipo**          | **Descrição**                             |
|-------------------|-------------------------------------------|
| `Promise<void>`   | Resolve quando o contexto foi registrado. |

**Exemplo de Uso:**

```javascript
// Registra o contexto com um método adicional
await CONTEXT.register({
    metodoAdicional: () => {
        console.log('Método adicional executado.');
    },
});
```