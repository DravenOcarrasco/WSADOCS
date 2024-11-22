# Criador de Contexto WSAction

## Menu Rápido
- [Visão Geral](#visão-geral)
- [Guia Rápido](#guia-rápido)
- [Referência da API](#referência-da-api)
  - [Comunicação](#comunicação)
  - [Armazenamento](#armazenamento)
  - [Interface do Usuário](#interface-do-usuário)
  - [Dados Customizados](#dados-customizados)
  - [Integração Chrome](#integração-chrome)
- [Exemplos Práticos](#exemplos-práticos)
- [Melhores Práticas](#melhores-práticas)

## Visão Geral

O Criador de Contexto é o coração de cada extensão WSAction, fornecendo uma interface padronizada para:
- 🔄 Comunicação via WebSocket
- 💾 Gerenciamento de dados
- 🖥️ Interface do usuário
- 🔧 Funcionalidades customizadas
- 🌐 Integração com Chrome

## Guia Rápido

### 1. Criando um Contexto Básico
```javascript
const CONTEXT = createModuleContext("MINHA-EXTENSAO");

// Registrar o contexto
await CONTEXT.register();
```

### 2. Adicionando Funcionalidades
```javascript
// Comunicação WebSocket
CONTEXT.ioEmit('evento', { dados: 'valor' });

// Armazenamento
await CONTEXT.setStorage('config', { tema: 'escuro' });

// Comandos de Teclado
CONTEXT.KEYBOARD_COMMANDS = [{
    description: "Ativar",
    keys: [
        { key: "ctrlKey", uppercase: false },
        { key: "a", uppercase: false }
    ],
    function: () => console.log('Ativado!')
}];
```

### 3. Exemplo Completo
```javascript
const CONTEXT = createModuleContext("MINHA-EXTENSAO");

// Configurar manipulador de menu
CONTEXT.setMenuHandler((options) => {
    Swal.fire({
        title: 'Menu',
        html: options.map(opt => 
            `<button onclick="${opt.action}">${opt.label}</button>`
        ).join('')
    });
});

// Adicionar dados customizados
CONTEXT.setCustomData('preferencias', {
    tema: 'escuro',
    notificacoes: true
});

// Registrar com funcionalidades adicionais
await CONTEXT.register({
    novaFuncao: () => console.log('Nova função!')
});
```

## Referência da API

### Comunicação

#### `ioEmit(event, data)`
Emite eventos WebSocket com prefixo automático do módulo.

```javascript
// Uso básico
CONTEXT.ioEmit('atualizar', { status: 'ok' });

// Com tratamento de resposta
CONTEXT.ioEmit('buscarDados', { id: 123 });
SOCKET.on('resultado', data => console.log(data));
```

### Armazenamento

#### `setStorage(key, value, isGlobal)`
Armazena dados por perfil ou globalmente.

```javascript
// Armazenamento por perfil
await CONTEXT.setStorage('config', {
    tema: 'escuro',
    fonte: 'Arial'
});

// Armazenamento global
await CONTEXT.setStorage('configGlobal', {
    idioma: 'pt-BR'
}, true);
```

#### `getStorage(key, isGlobal)`
Recupera dados armazenados.

```javascript
// Recuperar config do perfil
const config = await CONTEXT.getStorage('config');

// Recuperar config global
const configGlobal = await CONTEXT.getStorage('configGlobal', true);
```

### Interface do Usuário

#### `setMenuHandler(handler)`
Configura o manipulador de menu personalizado.

```javascript
CONTEXT.setMenuHandler((options) => {
    return Swal.fire({
        title: 'Menu da Extensão',
        html: `
            <div class="menu-container">
                ${options.map(opt => `
                    <button class="menu-item" onclick="${opt.action}">
                        ${opt.label}
                    </button>
                `).join('')}
            </div>
        `,
        showConfirmButton: false
    });
});
```

### Dados Customizados

#### `setCustomData(key, value)` e `getCustomData(key)`
Gerencia dados customizados em memória.

```javascript
// Armazenar estado temporário
CONTEXT.setCustomData('estado', {
    ativo: true,
    ultimaAtualizacao: Date.now()
});

// Recuperar estado
const estado = CONTEXT.getCustomData('estado');
```

### Integração Chrome

#### `sendChromeCommand(data)`
Envia comandos para a extensão Chrome.

```javascript
CONTEXT.sendChromeCommand({
    action: 'atualizarBadge',
    payload: {
        text: '1',
        color: '#FF0000'
    }
});
```

## Exemplos Práticos

### 1. Sistema de Notificações
```javascript
const CONTEXT = createModuleContext("NOTIFICACOES");

// Configurar armazenamento
await CONTEXT.setStorage('config', {
    som: true,
    desktop: true
});

// Adicionar manipulador de eventos
SOCKET.on('novaMensagem', async (msg) => {
    const config = await CONTEXT.getStorage('config');
    
    if (config.desktop) {
        new Notification(msg.titulo, {
            body: msg.conteudo
        });
    }
    
    if (config.som) {
        new Audio('notification.mp3').play();
    }
});

await CONTEXT.register();
```

### 2. Interface de Configurações
```javascript
const CONTEXT = createModuleContext("CONFIGURACOES");

CONTEXT.PUBLIC = {
    async showConfig() {
        const config = await CONTEXT.getStorage('config');
        
        const result = await Swal.fire({
            title: 'Configurações',
            html: `
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="som" 
                            ${config.som ? 'checked' : ''}>
                        Som
                    </label>
                    <label>
                        <input type="checkbox" id="desktop"
                            ${config.desktop ? 'checked' : ''}>
                        Notificações Desktop
                    </label>
                </div>
            `,
            confirmButtonText: 'Salvar'
        });

        if (result.isConfirmed) {
            const newConfig = {
                som: document.getElementById('som').checked,
                desktop: document.getElementById('desktop').checked
            };
            
            await CONTEXT.setStorage('config', newConfig);
            CONTEXT.ioEmit('configAtualizada', newConfig);
        }
    }
};

await CONTEXT.register();
```

## Melhores Práticas

1. **Organização do Código**
   - Mantenha o estado em um objeto centralizado
   - Use constantes para nomes de eventos
   - Documente funções públicas

2. **Gerenciamento de Estado**
   ```javascript
   const STATE = {
       isActive: false,
       data: null,
       lastUpdate: null
   };

   function updateState(newData) {
       STATE.data = newData;
       STATE.lastUpdate = Date.now();
       CONTEXT.ioEmit('stateChanged', STATE);
   }
   ```

3. **Tratamento de Erros**
   ```javascript
   try {
       const data = await CONTEXT.getStorage('config');
       // ... processar dados
   } catch (error) {
       console.error('Erro ao carregar config:', error);
       // Usar configuração padrão
       await CONTEXT.setStorage('config', DEFAULT_CONFIG);
   }
   ```

4. **Limpeza de Recursos**
   ```javascript
   // Remover listeners quando não necessários
   const cleanup = () => {
       SOCKET.off('evento');
       // Limpar outros recursos
   };

   // Usar em componentes React
   useEffect(() => {
       // Setup
       return cleanup;
   }, []);
   ```

5. **Modularização**
   ```javascript
   // services/storage.js
   export const StorageService = {
       async saveConfig(config) {
           await CONTEXT.setStorage('config', config);
       },
       async loadConfig() {
           return await CONTEXT.getStorage('config');
       }
   };

   // main.js
   import { StorageService } from './services/storage';
