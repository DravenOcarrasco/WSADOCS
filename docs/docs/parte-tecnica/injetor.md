# Documentação do Injetor WSAction

Bem-vindo à documentação do **Injetor WSAction**. Este guia fornece uma visão abrangente sobre como o injetor funciona, detalhando seus componentes, funcionalidades e processos de integração. Seja você um desenvolvedor buscando entender os internals ou um usuário interessado em utilizar suas capacidades, esta documentação fornecerá as informações necessárias.

---

## Índice

1. [Introdução](#introdução)
2. [Visão Geral](#visão-geral)
3. [Inicialização](#inicialização)
4. [Gerenciador de Contexto](#gerenciador-de-contexto)
5. [Módulo Base (`ModuleBase.js`)](#módulo-base-modulebasejs)
6. [Carregamento de Bibliotecas Externas](#carregamento-de-bibliotecas-externas)
7. [Gerenciamento de Extensões](#gerenciamento-de-extensões)
8. [Interface da Janela Flutuante](#interface-da-janela-flutuante)
9. [Manipulação de Eventos](#manipulação-de-eventos)
10. [Atalhos de Teclado](#atalhos-de-teclado)
11. [Tratamento de Erros](#tratamento-de-erros)
12. [Uso](#uso)
13. [Considerações de Segurança](#considerações-de-segurança)
14. [Conclusão](#conclusão)

---

## Introdução

O **Injetor WSAction** é um módulo JavaScript projetado para injetar dinamicamente funcionalidades e extensões em uma página web. Ele facilita a integração transparente de scripts externos, gerencia diversas extensões e fornece uma interface amigável para interagir com essas extensões através de uma janela flutuante. Com este injetor, desenvolvedores podem aprimorar aplicações web com recursos personalizáveis sem alterar a base de código principal.

---

## Visão Geral

O injetor realiza as seguintes tarefas principais:

1. **Inicialização:** Configura o objeto global `window.WSACTION` e garante uma única inicialização.
2. **Gerenciamento de Contexto:** Fornece um `CONTEXT_MANAGER` para lidar com extensões, eventos e comunicação.
3. **Módulo Base (`ModuleBase.js`):** Fornece uma forma rápida e eficiente de criar contextos para futuras extensões, evitando repetição de código.
4. **Carregamento de Bibliotecas Externas:** Carrega dinamicamente scripts externos essenciais para as operações do injetor.
5. **Gerenciamento de Extensões:** Busca e carrega extensões habilitadas, permitindo aprimoramentos modulares de funcionalidades.
6. **Interface da Janela Flutuante:** Cria uma janela flutuante arrastável e redimensionável para exibir e interagir com extensões carregadas.
7. **Manipulação de Eventos:** Facilita a comunicação entre extensões e o injetor através de listeners e emitters de eventos.
8. **Atalhos de Teclado:** Implementa atalhos para alternar a janela flutuante para acesso rápido.

**Nota:** Detalhes sobre o **Módulo Base (`ModuleBase.js`)** serão abordados em [uma seção específica](#módulo-base-modulebasejs).

---

## Inicialização

Ao ser executado, o injetor realiza os seguintes passos de inicialização:

1. **Configuração do Namespace:**
   - Garante que o objeto global `window.WSACTION` exista.
   - Evita múltiplas inicializações verificando se `window.WSACTION.CONTEXT_MANAGER` já está definido.

2. **Definição do Gerenciador de Contexto:**
   - Inicializa o `CONTEXT_MANAGER` com propriedades e métodos para gerenciar extensões e eventos.

3. **Modo de Compatibilidade:**
   - Define `window.extensionContext` como `window.WSACTION.CONTEXT_MANAGER` para compatibilidade com versões anteriores a `2.7.2`.

```javascript
(() => {
    'use strict';

    // Certifique-se de que window.WSACTION existe
    if (!window.WSACTION) {
        window.WSACTION = {};
    }

    // Evita múltiplas inicializações
    if (window.WSACTION.CONTEXT_MANAGER) {
        return;
    }

    // Definição do gerenciador de contexto
    window.WSACTION.CONTEXT_MANAGER = {
        extensions: {},
        events: {},
        initialized: true,

        // Métodos serão adicionados aqui...
    };

    // Modo de compatibilidade para versões < 2.7.2
    window.extensionContext = window.WSACTION.CONTEXT_MANAGER;

    // ... Resto do código
})();
```

---

## Gerenciador de Contexto

O **Gerenciador de Contexto** é o componente central responsável por gerenciar extensões e lidar com eventos. Ele oferece uma maneira estruturada de interagir com extensões e facilita a comunicação entre elas.

### Propriedades

- **extensions:** Um objeto que armazena as extensões carregadas.
- **events:** Um objeto que gerencia os listeners de eventos.
- **initialized:** Um booleano indicando se o gerenciador de contexto foi inicializado.

### Métodos

- **on(event, listener):** Registra um listener para um evento específico.
- **off(event, listener):** Remove um listener específico de um evento.
- **emit(event, data):** Emite um evento, acionando todos os listeners associados.
- **awaitExtension(name):** Retorna uma promessa que resolve quando a extensão especificada é carregada.
- **addExtension(name, context):** Adiciona uma nova extensão ao gerenciador e emite um evento `extensionLoaded`.
- **getExtension(name):** Recupera uma extensão carregada pelo nome.
- **isExtensionLoaded(context):** Verifica se uma extensão específica está carregada.

### Implementação

```javascript
window.WSACTION.CONTEXT_MANAGER = {
    extensions: {},
    events: {},
    initialized: true,

    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    },

    off(event, listener) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(l => l !== listener);
    },

    emit(event, data) {
        if (!this.events[event]) return;
        this.events[event].forEach(listener => listener(data));
    },

    awaitExtension(name) {
        return new Promise((resolve) => {
            // Verifica se a extensão já foi carregada
            if (this.extensions[name]) {
                resolve(this.extensions[name]);
            } else {
                // Listener para a extensão
                const listener = (context) => {
                    if (context.NAME === name) {
                        resolve(context);
                        this.off('extensionLoaded', listener); // Remove o listener após resolver
                    }
                };
                // Escuta o evento 'extensionLoaded'
                this.on('extensionLoaded', listener);
            }
        });
    },

    addExtension(name, context) {
        if (!this.extensions[name]) {
            this.extensions[name] = context;
            this.emit('extensionLoaded', context); // Emite evento quando uma extensão é carregada
        }
    },

    getExtension(name) {
        return this.extensions[name] || null;
    },

    isExtensionLoaded(context) {
        return Object.prototype.hasOwnProperty.call(this.extensions, context.NAME);
    },
};
```

---

## Módulo Base (`ModuleBase.js`)

O **Módulo Base** (`ModuleBase.js`) é uma função fundamental que oferece uma maneira rápida e eficiente de criar contextos para futuras extensões. Ele permite que as extensões utilizem este módulo para desenvolver suas funções principais sem a necessidade de repetir código, uma melhoria significativa em relação às versões anteriores.

**Nota:** Para detalhes completos sobre o `ModuleBase.js`, consulte a [seção dedicada](#módulo-base-modulebasejs).

---

## Carregamento de Bibliotecas Externas

O injetor carrega dinamicamente bibliotecas externas essenciais para seu funcionamento. Isso garante que as dependências sejam carregadas apenas quando necessário, otimizando o desempenho e reduzindo os tempos de carregamento iniciais.

### Bibliotecas Carregadas

1. **jQuery (`jquery-3.6.0.min.js`):** Uma biblioteca JavaScript rápida, pequena e rica em funcionalidades.
2. **SweetAlert2 (`sweetalert2.js`):** Um substituto bonito, responsivo, personalizável e acessível para caixas de diálogo padrão do JavaScript.
3. **Socket.IO (`socket.io.js`):** Habilita comunicação em tempo real, bidirecional e baseada em eventos.
4. **ModuleBase (`ModuleBase.js`):** Um módulo base para gerenciar extensões.

### Implementação

```javascript
// Função para adicionar um script dinamicamente
const addScript = (src) => {
    return new Promise((resolve, reject) => {
        // Validação básica da URL
        const allowedOrigins = ['http://localhost', 'https://seu-dominio.com']; // Adicione as origens permitidas
        try {
            const url = new URL(src);
            if (!allowedOrigins.includes(url.origin)) {
                console.error(`⚠️ Origem não permitida: ${url.origin}`);
                reject(new Error(`Origem não permitida: ${url.origin}`));
                return;
            }
        } catch (e) {
            console.error(`⚠️ URL inválida: ${src}`);
            reject(new Error(`URL inválida: ${src}`));
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = () => {
            Swal.fire({
                icon: 'error',
                title: 'Erro ao carregar extensão',
                text: `Não foi possível carregar a extensão do URL: ${src}`,
                confirmButtonText: 'Ok',
            });
            reject(new Error(`Erro ao carregar ${src}`));
        };
        document.head.appendChild(script);
    });
};

// Função para aguardar até que a configuração esteja pronta
const waitForConfig = () => {
    return new Promise((resolve) => {
        const checkConfig = () => {
            if (window.WSACTION && window.WSACTION.config && window.WSACTION.config.ip && window.WSACTION.config.port) {
                resolve(); // Configuração está pronta
            } else {
                setTimeout(checkConfig, 100); // Verifica novamente após 100ms
            }
        };
        checkConfig();
    });
};

// Função para carregar as bibliotecas necessárias
const loadLibraries = async () => {
    await waitForConfig();

    const { ip, port } = window.WSACTION.config;
    const baseUrl = `http://${ip}:${port}`;

    const libraries = [
        `${baseUrl}/js/jquery-3.6.0.min.js`,
        `${baseUrl}/js/sweetalert2.js`,
        `${baseUrl}/js/socket.io.js`,
        `${baseUrl}/js/ModuleBase.js`,
    ];

    try {
        await Promise.all(libraries.map(addScript));
        console.log('📚 Bibliotecas carregadas com sucesso.');
    } catch (error) {
        console.error('❌ Erro ao carregar as bibliotecas:', error);
    }
};
```

---

## Gerenciamento de Extensões

O injetor busca e carrega extensões habilitadas, permitindo aprimoramentos modulares de funcionalidades na aplicação web. Cada extensão pode adicionar funcionalidades específicas, como comandos de teclado, interfaces de usuário personalizadas, entre outros.

### Carregamento de Extensões Habilitadas

1. **Busca de Extensões Habilitadas:**
   - Envia uma requisição para obter a lista de extensões habilitadas.
   - Exemplo de URL: `http://<ip>:<port>/extensions`

2. **Carregamento de Cada Extensão:**
   - Para cada extensão habilitada, constrói a URL do script cliente e o carrega dinamicamente.
   - Exemplo de URL: `http://<ip>:<port>/ext/<NomeDaExtensão>/client`

### Implementação

```javascript
// Função para carregar uma extensão
const loadExtension = async (extension) => {
    const scriptUrl = `http://${window.WSACTION.config.ip}:${window.WSACTION.config.port}/ext/${encodeURIComponent(extension.NAME)}/client`;
    await addScript(scriptUrl);
};

// Função para carregar as extensões habilitadas
const loadEnabledExtensions = async () => {
    try {
        const { ip, port } = window.WSACTION.config;
        const response = await fetch(`http://${ip}:${port}/extensions`);
        const data = await response.json();
        const enabledExtensions = data.ENABLED || [];

        if (enabledExtensions.length === 0) {
            console.log('ℹ️ Nenhuma extensão habilitada encontrada.');
            return;
        }

        await Promise.all(enabledExtensions.map(loadExtension));
        console.log('🧩 Extensões carregadas com sucesso.');
    } catch (error) {
        console.error('❌ Erro ao carregar extensões habilitadas:', error);
    }
};
```

### Integração com o `ModuleBase.js`

Cada extensão utiliza o `ModuleBase.js` para criar seu contexto, registrando-se automaticamente no `CONTEXT_MANAGER`. Isso permite uma integração rápida e eficiente, garantindo que todas as extensões sejam gerenciadas de forma consistente.

**Nota:** Detalhes sobre o `ModuleBase.js` podem ser encontrados na [seção dedicada](#módulo-base-modulebasejs).

---

## Interface da Janela Flutuante

O injetor cria uma **janela flutuante** que exibe as extensões carregadas, permitindo interação direta com elas. A janela é arrastável, redimensionável e fornece uma interface amigável para visualizar e interagir com as funcionalidades das extensões.

### Criação da Janela Flutuante

```javascript
// Função para criar a janela flutuante
const createFloatingWindow = () => {
    if (document.getElementById('floating-window')) return; // Evita duplicação

    floatingWindow = document.createElement('div');
    floatingWindow.id = 'floating-window';
    Object.assign(floatingWindow.style, {
        position: 'fixed',
        top: '10px',
        right: '10px',
        width: '350px',
        height: '500px',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        overflowY: 'auto',
        zIndex: '10000',
        display: 'none', // Inicialmente escondido
        fontFamily: 'Arial, sans-serif',
    });

    const header = document.createElement('div');
    Object.assign(header.style, {
        padding: '10px',
        backgroundColor: '#007BFF',
        borderBottom: '1px solid #ccc',
        fontWeight: 'bold',
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    });
    header.textContent = 'Extensões Carregadas';

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    Object.assign(closeButton.style, {
        background: 'none',
        border: 'none',
        color: '#fff',
        fontSize: '20px',
        cursor: 'pointer',
    });
    closeButton.addEventListener('click', () => {
        floatingWindow.style.display = 'none';
    });

    header.appendChild(closeButton);

    const list = document.createElement('ul');
    list.id = 'extensions-list';
    Object.assign(list.style, {
        listStyleType: 'none',
        padding: '10px',
        margin: '0',
    });

    floatingWindow.appendChild(header);
    floatingWindow.appendChild(list);
    document.body.appendChild(floatingWindow);

    // Tornar a janela flutuante arrastável
    makeWindowDraggable(floatingWindow, header);
};
```

### Registro de Extensões na Janela Flutuante

```javascript
// Função para registrar uma extensão na janela flutuante
const registerExtension = (name) => {
    const list = document.getElementById('extensions-list');
    if (!list) return;

    const listItem = document.createElement('li');
    Object.assign(listItem.style, {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px',
        fontWeight: 'bold',
        color: '#333',
        cursor: 'pointer',
        padding: '5px',
        borderRadius: '5px',
        transition: 'background-color 0.2s',
    });

    listItem.addEventListener('mouseover', () => {
        listItem.style.backgroundColor = '#f0f0f0';
    });

    listItem.addEventListener('mouseout', () => {
        listItem.style.backgroundColor = 'transparent';
    });

    const iconUrl = `http://${window.WSACTION.config.ip}:${window.WSACTION.config.port}/ext/${encodeURIComponent(name)}/icon`;
    fetch(iconUrl)
        .then(response => response.text())
        .then(base64Icon => {
            const icon = document.createElement('img');
            Object.assign(icon, {
                src: base64Icon,
                alt: name,
            });
            Object.assign(icon.style, {
                width: '24px',
                height: '24px',
                marginRight: '10px',
                borderRadius: '50%',
            });

            const text = document.createElement('span');
            text.textContent = name;
            Object.assign(text.style, {
                flexGrow: '1',
            });

            const infoButton = document.createElement('button');
            infoButton.textContent = 'Info';
            Object.assign(infoButton.style, {
                padding: '5px 10px',
                border: 'none',
                backgroundColor: '#007BFF',
                color: '#fff',
                borderRadius: '5px',
                cursor: 'pointer',
            });

            infoButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Impede o evento de clique do pai
                showExtensionCommands(name);
            });

            listItem.appendChild(icon);
            listItem.appendChild(text);
            listItem.appendChild(infoButton);
            list.appendChild(listItem);

            // Adicionar listener de clique para ativar a extensão ou mostrar mais opções
            listItem.addEventListener('click', () => {
                // Defina o que acontece quando o item é clicado
                // Por agora, vamos apenas mostrar os comandos
                showExtensionCommands(name);
            });
        })
        .catch(error => {
            console.error(`❌ Erro ao carregar o ícone da extensão ${name}:`, error);
        });
};
```

### Exibição dos Comandos da Extensão

```javascript
// Função para exibir os comandos da extensão
const showExtensionCommands = (extensionName) => {
    const extensionContext = CONTEXTS[extensionName];
    if (extensionContext) {
        const commandsList = extensionContext.KEYBOARD_COMMANDS || [];
        const commandsHTML = commandsList
            .map(command => `
                <div style="margin-bottom: 10px;">
                    <strong>${command.description}:</strong> ${command.keys.map(k => `<kbd>${k.key}</kbd>`).join(' + ')}
                </div>
            `)
            .join('');

        Swal.fire({
            title: `Comandos da Extensão: ${extensionName}`,
            html: commandsHTML || '<p>Sem comandos disponíveis</p>',
            width: 600,
            padding: '3em',
            background: '#fff',
            confirmButtonText: 'Fechar',
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: `Comandos não encontrados para a extensão ${extensionName}`,
            confirmButtonText: 'Ok',
        });
    }
};
```

---

## Manipulação de Eventos

O injetor utiliza um sistema de eventos para facilitar a comunicação entre as extensões e o gerenciador de contexto. Isso permite que as extensões emitam eventos e escutem por eventos específicos, promovendo uma interação eficiente e modular.

### Registro e Emissão de Eventos

```javascript
// Listener para registrar extensões quando carregadas
window.WSACTION.CONTEXT_MANAGER.on('extensionLoaded', (context) => {
    CONTEXTS[context.MODULE_NAME] = context;
    registerExtension(context.MODULE_NAME);
});
```

- **`on(event, listener)`:** Registra um listener para o evento `extensionLoaded`.
- **`emit(event, data)`:** Emite o evento `extensionLoaded` quando uma nova extensão é adicionada.

### Fluxo de Eventos

1. **Carregamento de uma Extensão:**
   - Quando uma extensão é carregada, ela utiliza o `ModuleBase.js` para criar seu contexto.
   - O `ModuleBase` registra a extensão no `CONTEXT_MANAGER`, emitindo o evento `extensionLoaded`.

2. **Listener de `extensionLoaded`:**
   - O `CONTEXT_MANAGER` possui um listener para o evento `extensionLoaded`.
   - Quando o evento é emitido, o listener adiciona a extensão ao objeto `CONTEXTS` e a registra na janela flutuante.

3. **Interação do Usuário:**
   - O usuário pode interagir com a extensão através da janela flutuante, acionando comandos ou visualizando informações.

---

## Atalhos de Teclado

Para proporcionar uma experiência de usuário mais fluida, o injetor implementa atalhos de teclado que permitem aos usuários alternar a visibilidade da janela flutuante de forma rápida e conveniente.

### Implementação do Atalho

```javascript
// Atalho de teclado para alternar a janela flutuante (Ctrl+Alt+P)
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'p') {
        toggleFloatingWindow();
    }
});
```

- **Ctrl + Alt + P:** Alterna a visibilidade da janela flutuante.

### Personalização de Atalhos

Se desejar alterar o atalho de teclado, ajuste a condição dentro do listener de eventos conforme necessário.

```javascript
// Exemplo: Atalho Ctrl+Shift+M
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'm') {
        toggleFloatingWindow();
    }
});
```

---

## Tratamento de Erros

O injetor implementa mecanismos de tratamento de erros para garantir que falhas na carga de scripts ou extensões sejam devidamente notificadas ao usuário, evitando comportamentos inesperados e facilitando a depuração.

### Exemplo de Tratamento de Erros na Carga de Scripts

```javascript
script.onerror = () => {
    Swal.fire({
        icon: 'error',
        title: 'Erro ao carregar extensão',
        text: `Não foi possível carregar a extensão do URL: ${src}`,
        confirmButtonText: 'Ok',
    });
    reject(new Error(`Erro ao carregar ${src}`));
};
```

- **SweetAlert2:** Utilizado para exibir uma mensagem de erro amigável ao usuário.
- **Rejeição da Promessa:** Garante que o erro seja propagado e possa ser tratado adequadamente.

### Tratamento de Erros no Carregamento de Extensões

```javascript
// Função para carregar as extensões habilitadas
const loadEnabledExtensions = async () => {
    try {
        const { ip, port } = window.WSACTION.config;
        const response = await fetch(`http://${ip}:${port}/extensions`);
        const data = await response.json();
        const enabledExtensions = data.ENABLED || [];

        if (enabledExtensions.length === 0) {
            console.log('ℹ️ Nenhuma extensão habilitada encontrada.');
            return;
        }

        await Promise.all(enabledExtensions.map(loadExtension));
        console.log('🧩 Extensões carregadas com sucesso.');
    } catch (error) {
        console.error('❌ Erro ao carregar extensões habilitadas:', error);
    }
};
```

- **Console Logging:** Logs de erro são exibidos no console para facilitar a identificação e correção de problemas.
- **Notificações ao Usuário:** Mensagens de erro são exibidas ao usuário através do SweetAlert2 para garantir que ele esteja ciente de falhas críticas.

---

## Uso

### Inicialização do Injetor

O injetor é executado imediatamente após ser carregado, realizando as seguintes ações:

1. **Criação da Janela Flutuante:**
   - Garante que a janela não seja duplicada.
   - Define estilos e funcionalidades de arrastabilidade.

2. **Carregamento de Bibliotecas e Extensões:**
   - Aguarda a configuração necessária (`ip` e `port`).
   - Carrega bibliotecas externas essenciais.
   - Busca e carrega extensões habilitadas.

### Ativação da Janela Flutuante

- **Via Atalho de Teclado:** Pressione **Ctrl + Alt + P** para alternar a visibilidade da janela flutuante.
- **Via Interface:** Clique no botão de fechar na janela para ocultá-la.

### Interação com Extensões

- **Visualização de Comandos:**
  - Clique no botão "Info" ao lado de uma extensão para visualizar seus comandos de teclado.

- **Registro de Extensões:**
  - Extensões carregadas são exibidas na lista dentro da janela flutuante.
  - Cada extensão possui um ícone, nome e botão de informações.

### Exemplo de Fluxo de Uso

1. **Carregamento Inicial:**
   - O injetor espera que a configuração (`window.WSACTION.config`) esteja pronta.
   - Carrega as bibliotecas externas necessárias.

2. **Carregamento de Extensões:**
   - Busca as extensões habilitadas no servidor.
   - Carrega cada extensão dinamicamente.

3. **Registro e Exibição:**
   - Cada extensão carregada é registrada no `CONTEXT_MANAGER`.
   - A extensão é adicionada à lista na janela flutuante com seu ícone e nome.

4. **Interação do Usuário:**
   - O usuário pode alternar a janela flutuante usando o atalho de teclado ou interagindo diretamente na interface.
   - Ao clicar em uma extensão, os comandos disponíveis são exibidos via SweetAlert2.

---

## Considerações de Segurança

Ao injetar scripts e carregar extensões dinamicamente, é crucial considerar as implicações de segurança para proteger tanto a aplicação quanto os usuários.

### Boas Práticas

1. **Validação de Extensões:**
   - Assegure-se de que apenas extensões confiáveis e verificadas sejam carregadas.

2. **Sanitização de Dados:**
   - Sempre sanitize inputs e outputs para prevenir vulnerabilidades como Cross-Site Scripting (XSS).

3. **Controle de Acesso:**
   - Implemente mecanismos de autenticação e autorização para gerenciar quem pode adicionar ou modificar extensões.

4. **Uso de HTTPS:**
   - Sempre carregue scripts e extensões através de conexões seguras para evitar ataques de man-in-the-middle.

5. **Restrição de Origem de Scripts:**
   - Limite as fontes de onde os scripts podem ser carregados, evitando carregamento de fontes não confiáveis.

6. **Revisão de Código das Extensões:**
   - Realize auditorias de segurança nas extensões antes de disponibilizá-las para uso.

### Implementação no Código

```javascript
// Exemplo de carregamento seguro de scripts
const addScript = (src) => {
    return new Promise((resolve, reject) => {
        // Validação básica da URL
        const allowedOrigins = ['https://seu-dominio.com', 'http://localhost']; // Adicione as origens permitidas
        try {
            const url = new URL(src);
            if (!allowedOrigins.includes(url.origin)) {
                console.error(`⚠️ Origem não permitida: ${url.origin}`);
                reject(new Error(`Origem não permitida: ${url.origin}`));
                return;
            }
        } catch (e) {
            console.error(`⚠️ URL inválida: ${src}`);
            reject(new Error(`URL inválida: ${src}`));
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = () => {
            Swal.fire({
                icon: 'error',
                title: 'Erro ao carregar extensão',
                text: `Não foi possível carregar a extensão do URL: ${src}`,
                confirmButtonText: 'Ok',
            });
            reject(new Error(`Erro ao carregar ${src}`));
        };
        document.head.appendChild(script);
    });
};
```

---

## Conclusão

O **Injetor WSAction** fornece uma maneira eficiente e modular de adicionar funcionalidades dinâmicas a páginas web através de extensões. Ao gerenciar contextos, eventos e interfaces de usuário de forma organizada, o injetor facilita a integração e a expansão de aplicações sem a necessidade de alterações profundas no código base.

### Recomendações Finais

- **Otimização de Desempenho:** Importe apenas os ícones e bibliotecas necessárias para manter o tamanho do bundle otimizado.
- **Manutenção de Extensões:** Mantenha o `docsList.json` atualizado e verifique regularmente a integridade das extensões carregadas.
- **Monitoramento e Logs:** Utilize ferramentas de monitoramento para acompanhar o desempenho e identificar rapidamente quaisquer problemas ou falhas.
- **Documentação das Extensões:** Forneça documentação clara para desenvolvedores que criarem novas extensões, garantindo consistência e facilidade de integração.
- **Revisão de Segurança:** Realize auditorias de segurança periódicas para garantir que o injetor e as extensões não introduzam vulnerabilidades na aplicação.

Se você tiver mais dúvidas ou precisar de assistência adicional, sinta-se à vontade para consultar esta documentação ou entrar em contato com a equipe de suporte.

---

## Código Completo

Para facilitar o entendimento, abaixo está o código completo do injetor WSAction com comentários explicativos:

```javascript
(() => {
    'use strict';

    // Certifique-se de que window.WSACTION existe
    if (!window.WSACTION) {
        window.WSACTION = {};
    }

    // Evita múltiplas inicializações
    if (window.WSACTION.CONTEXT_MANAGER) {
        return;
    }

    const CONTEXTS = {};
    let floatingWindow;

    // Define o gerenciador de contexto
    window.WSACTION.CONTEXT_MANAGER = {
        extensions: {},
        events: {},
        initialized: true,

        on(event, listener) {
            if (!this.events[event]) {
                this.events[event] = [];
            }
            this.events[event].push(listener);
        },

        off(event, listener) {
            if (!this.events[event]) return;
            this.events[event] = this.events[event].filter(l => l !== listener);
        },

        emit(event, data) {
            if (!this.events[event]) return;
            this.events[event].forEach(listener => listener(data));
        },

        awaitExtension(name) {
            return new Promise((resolve) => {
                // Verifica se a extensão já foi carregada
                if (this.extensions[name]) {
                    resolve(this.extensions[name]);
                } else {
                    // Listener para a extensão
                    const listener = (context) => {
                        if (context.NAME === name) {
                            resolve(context);
                            this.off('extensionLoaded', listener); // Remove o listener após resolver
                        }
                    };
                    // Escuta o evento 'extensionLoaded'
                    this.on('extensionLoaded', listener);
                }
            });
        },

        addExtension(name, context) {
            if (!this.extensions[name]) {
                this.extensions[name] = context;
                this.emit('extensionLoaded', context); // Emite evento quando uma extensão é carregada
            }
        },

        getExtension(name) {
            return this.extensions[name] || null;
        },

        isExtensionLoaded(context) {
            return Object.prototype.hasOwnProperty.call(this.extensions, context.NAME);
        },
    };

    // Modo de compatibilidade para versões < 2.7.2
    window.extensionContext = window.WSACTION.CONTEXT_MANAGER;

    // Função para adicionar um script dinamicamente
    const addScript = (src) => {
        return new Promise((resolve, reject) => {
            // Validação básica da URL
            const allowedOrigins = ['http://localhost', 'https://seu-dominio.com']; // Adicione as origens permitidas
            try {
                const url = new URL(src);
                if (!allowedOrigins.includes(url.origin)) {
                    console.error(`⚠️ Origem não permitida: ${url.origin}`);
                    reject(new Error(`Origem não permitida: ${url.origin}`));
                    return;
                }
            } catch (e) {
                console.error(`⚠️ URL inválida: ${src}`);
                reject(new Error(`URL inválida: ${src}`));
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = () => {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro ao carregar extensão',
                    text: `Não foi possível carregar a extensão do URL: ${src}`,
                    confirmButtonText: 'Ok',
                });
                reject(new Error(`Erro ao carregar ${src}`));
            };
            document.head.appendChild(script);
        });
    };

    // Função para carregar uma extensão
    const loadExtension = async (extension) => {
        const scriptUrl = `http://${window.WSACTION.config.ip}:${window.WSACTION.config.port}/ext/${encodeURIComponent(extension.NAME)}/client`;
        await addScript(scriptUrl);
    };

    // Função para aguardar até que a configuração esteja pronta
    const waitForConfig = () => {
        return new Promise((resolve) => {
            const checkConfig = () => {
                if (window.WSACTION && window.WSACTION.config && window.WSACTION.config.ip && window.WSACTION.config.port) {
                    resolve(); // Configuração está pronta
                } else {
                    setTimeout(checkConfig, 100); // Verifica novamente após 100ms
                }
            };
            checkConfig();
        });
    };

    // Função para carregar as bibliotecas necessárias
    const loadLibraries = async () => {
        await waitForConfig();

        const { ip, port } = window.WSACTION.config;
        const baseUrl = `http://${ip}:${port}`;

        const libraries = [
            `${baseUrl}/js/jquery-3.6.0.min.js`,
            `${baseUrl}/js/sweetalert2.js`,
            `${baseUrl}/js/socket.io.js`,
            `${baseUrl}/js/ModuleBase.js`,
        ];

        try {
            await Promise.all(libraries.map(addScript));
            console.log('📚 Bibliotecas carregadas com sucesso.');
        } catch (error) {
            console.error('❌ Erro ao carregar as bibliotecas:', error);
        }
    };

    // Função para carregar as extensões habilitadas
    const loadEnabledExtensions = async () => {
        try {
            const { ip, port } = window.WSACTION.config;
            const response = await fetch(`http://${ip}:${port}/extensions`);
            const data = await response.json();
            const enabledExtensions = data.ENABLED || [];

            if (enabledExtensions.length === 0) {
                console.log('ℹ️ Nenhuma extensão habilitada encontrada.');
                return;
            }

            await Promise.all(enabledExtensions.map(loadExtension));
            console.log('🧩 Extensões carregadas com sucesso.');
        } catch (error) {
            console.error('❌ Erro ao carregar extensões habilitadas:', error);
        }
    };

    // Função para registrar uma extensão na janela flutuante
    const registerExtension = (name) => {
        const list = document.getElementById('extensions-list');
        if (!list) return;

        const listItem = document.createElement('li');
        Object.assign(listItem.style, {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '10px',
            fontWeight: 'bold',
            color: '#333',
            cursor: 'pointer',
            padding: '5px',
            borderRadius: '5px',
            transition: 'background-color 0.2s',
        });

        listItem.addEventListener('mouseover', () => {
            listItem.style.backgroundColor = '#f0f0f0';
        });

        listItem.addEventListener('mouseout', () => {
            listItem.style.backgroundColor = 'transparent';
        });

        const iconUrl = `http://${window.WSACTION.config.ip}:${window.WSACTION.config.port}/ext/${encodeURIComponent(name)}/icon`;
        fetch(iconUrl)
            .then(response => response.text())
            .then(base64Icon => {
                const icon = document.createElement('img');
                Object.assign(icon, {
                    src: base64Icon,
                    alt: name,
                });
                Object.assign(icon.style, {
                    width: '24px',
                    height: '24px',
                    marginRight: '10px',
                    borderRadius: '50%',
                });

                const text = document.createElement('span');
                text.textContent = name;
                Object.assign(text.style, {
                    flexGrow: '1',
                });

                const infoButton = document.createElement('button');
                infoButton.textContent = 'Info';
                Object.assign(infoButton.style, {
                    padding: '5px 10px',
                    border: 'none',
                    backgroundColor: '#007BFF',
                    color: '#fff',
                    borderRadius: '5px',
                    cursor: 'pointer',
                });

                infoButton.addEventListener('click', (e) => {
                    e.stopPropagation(); // Impede o evento de clique do pai
                    showExtensionCommands(name);
                });

                listItem.appendChild(icon);
                listItem.appendChild(text);
                listItem.appendChild(infoButton);
                list.appendChild(listItem);

                // Adicionar listener de clique para ativar a extensão ou mostrar mais opções
                listItem.addEventListener('click', () => {
                    // Defina o que acontece quando o item é clicado
                    // Por agora, vamos apenas mostrar os comandos
                    showExtensionCommands(name);
                });
            })
            .catch(error => {
                console.error(`❌ Erro ao carregar o ícone da extensão ${name}:`, error);
            });
    };

    // Função para exibir os comandos da extensão
    const showExtensionCommands = (extensionName) => {
        const extensionContext = CONTEXTS[extensionName];
        if (extensionContext) {
            const commandsList = extensionContext.KEYBOARD_COMMANDS || [];
            const commandsHTML = commandsList
                .map(command => `
                    <div style="margin-bottom: 10px;">
                        <strong>${command.description}:</strong> ${command.keys.map(k => `<kbd>${k.key}</kbd>`).join(' + ')}
                    </div>
                `)
                .join('');

            Swal.fire({
                title: `Comandos da Extensão: ${extensionName}`,
                html: commandsHTML || '<p>Sem comandos disponíveis</p>',
                width: 600,
                padding: '3em',
                background: '#fff',
                confirmButtonText: 'Fechar',
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Erro',
                text: `Comandos não encontrados para a extensão ${extensionName}`,
                confirmButtonText: 'Ok',
            });
        }
    };

    // Função para criar a janela flutuante
    const createFloatingWindow = () => {
        if (document.getElementById('floating-window')) return; // Evita duplicação

        floatingWindow = document.createElement('div');
        floatingWindow.id = 'floating-window';
        Object.assign(floatingWindow.style, {
            position: 'fixed',
            top: '10px',
            right: '10px',
            width: '350px',
            height: '500px',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            overflowY: 'auto',
            zIndex: '10000',
            display: 'none', // Inicialmente escondido
            fontFamily: 'Arial, sans-serif',
        });

        const header = document.createElement('div');
        Object.assign(header.style, {
            padding: '10px',
            backgroundColor: '#007BFF',
            borderBottom: '1px solid #ccc',
            fontWeight: 'bold',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        });
        header.textContent = 'Extensões Carregadas';

        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        Object.assign(closeButton.style, {
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '20px',
            cursor: 'pointer',
        });
        closeButton.addEventListener('click', () => {
            floatingWindow.style.display = 'none';
        });

        header.appendChild(closeButton);

        const list = document.createElement('ul');
        list.id = 'extensions-list';
        Object.assign(list.style, {
            listStyleType: 'none',
            padding: '10px',
            margin: '0',
        });

        floatingWindow.appendChild(header);
        floatingWindow.appendChild(list);
        document.body.appendChild(floatingWindow);

        // Tornar a janela flutuante arrastável
        makeWindowDraggable(floatingWindow, header);
    };

    // Função para tornar a janela flutuante arrastável
    const makeWindowDraggable = (windowElement, handleElement) => {
        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        handleElement.style.cursor = 'move';

        handleElement.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - windowElement.offsetLeft;
            offsetY = e.clientY - windowElement.offsetTop;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                windowElement.style.left = `${e.clientX - offsetX}px`;
                windowElement.style.top = `${e.clientY - offsetY}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    };

    // Função para alternar a janela flutuante
    const toggleFloatingWindow = () => {
        if (floatingWindow) {
            floatingWindow.style.display = (floatingWindow.style.display === 'none') ? 'block' : 'none';
        }
    };

    // Atalho de teclado para alternar a janela flutuante (Ctrl+Alt+P)
    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'p') {
            toggleFloatingWindow();
        }
    });

    // Listener para registrar extensões quando carregadas
    window.WSACTION.CONTEXT_MANAGER.on('extensionLoaded', (context) => {
        CONTEXTS[context.MODULE_NAME] = context;
        registerExtension(context.MODULE_NAME);
    });

    // Inicializa a janela flutuante imediatamente
    createFloatingWindow();

    // Carrega as bibliotecas e extensões imediatamente
    loadLibraries().then(loadEnabledExtensions);

})();
```

---

## Módulo Base (`ModuleBase.js`)

O **Módulo Base** (`ModuleBase.js`) é uma função fundamental que oferece uma maneira rápida e eficiente de criar contextos para futuras extensões. Ele permite que as extensões utilizem este módulo para desenvolver suas funções principais sem a necessidade de repetir código, uma melhoria significativa em relação às versões anteriores.

### Objetivo

- **Evitar Repetição de Código:** Fornece uma estrutura padronizada para extensões, eliminando a necessidade de duplicar funcionalidades comuns.
- **Facilitar a Criação de Extensões:** Simplifica o processo de desenvolvimento de novas extensões, permitindo que os desenvolvedores se concentrem nas funcionalidades específicas.
- **Garantir Consistência:** Assegura que todas as extensões sigam um padrão consistente, facilitando a manutenção e o gerenciamento.

### Funcionalidades

1. **Criação de Contexto:** Fornece um ambiente isolado para cada extensão, permitindo que elas operem de forma independente.
2. **Registro de Funcionalidades:** Permite que as extensões registrem suas principais funções e comandos de forma centralizada.
3. **Comunicação com o Gerenciador de Contexto:** Facilita a interação entre a extensão e o `CONTEXT_MANAGER`, permitindo acesso fácil e controle das extensões carregadas.