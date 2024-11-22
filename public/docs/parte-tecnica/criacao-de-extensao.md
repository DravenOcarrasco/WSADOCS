# Guia Completo de Desenvolvimento de Extensões WSActions

## Sumário
- [Estrutura Básica](#estrutura-básica)
  - [Arquivos Necessários](#1-arquivos-necessários)
  - [Metadados (meta.json)](#2-metadados-metajson)
- [Arquitetura Cliente-Servidor](#arquitetura-cliente-servidor)
  - [Cliente (client.js)](#1-cliente-clientjs)
  - [Servidor (index.js)](#2-servidor-indexjs)
- [Sistema de Armazenamento](#sistema-de-armazenamento)
  - [Storage por Perfil](#1-storage-por-perfil)
  - [Storage Global](#2-storage-global)
  - [Boas Práticas de Storage](#3-boas-práticas-de-storage)
- [Comunicação](#comunicação)
  - [Cliente para Servidor](#1-cliente-para-servidor)
  - [Servidor para Cliente(s)](#2-servidor-para-clientes)
  - [Acesso a Outras Extensões](#3-acesso-a-outras-extensões)
- [Exemplos Completos](#exemplos-completos)
  - [Extensão Básica](#1-extensão-básica)
  - [Gerenciamento de Estado e UI](#2-gerenciamento-de-estado-e-ui)
- [Boas Práticas](#boas-práticas)
- [Notas Finais](#notas-finais)

## Estrutura Básica

### 1. Arquivos Necessários
```
MinhaExtensao/
  ├── client.js     # Código do lado do cliente
  ├── index.js      # Código do lado do servidor
  ├── meta.json     # Metadados da extensão
  └── icon.png      # Ícone da extensão
```

### 2. Metadados (meta.json)
```json
{
    "name": "MinhaExtensao",
    "version": "1.0.0",
    "github": "https://github.com/seu-repo",
    "minVersion": "2.7.0-BETA",
    "compatibility": ["2.7.0-BETA"],
    "id": "1234567890abc-TEMP",
    "WEB_SCRIPTS": ["client.js"]
}
```

#### Campos Obrigatórios
- `name`: Nome da extensão
- `version`: Versão atual
- `minVersion`: Versão mínima do WSActions necessária
- `WEB_SCRIPTS`: Array de scripts do cliente a serem carregados

#### Campos Opcionais
- `github`: URL do repositório
- `compatibility`: Array de versões compatíveis
- `id`: Identificador único (gerado automaticamente se não fornecido)

## Arquitetura Cliente-Servidor

### 1. Cliente (client.js)
- Executa no navegador
- Controle da interface do usuário
- Manipulação do DOM
- Interação com o navegador
- Atalhos de teclado
- Interface visual (SweetAlert2)

### 2. Servidor (index.js)
- Executa na máquina local
- Acesso ao sistema de arquivos
- Gerenciamento de WebSocket
- Controle da máquina
- Comunicação entre perfis
- Persistência de dados

## Sistema de Armazenamento

### 1. Storage por Perfil
```javascript
// No client.js
await CONTEXT.setStorage('minhaChave', valor);
const dadosPerfil = await CONTEXT.getStorage('minhaChave');
```

### 2. Storage Global
```javascript
// Compartilhado entre todos os perfis
await CONTEXT.setVariable('minhaVar', valor, true); // true = global
const dadosGlobais = await CONTEXT.getVariable('minhaVar', valorPadrao, true);
```

### 3. Boas Práticas de Storage
- Use storage por perfil para dados específicos do usuário
- Use storage global para configurações compartilhadas
- Evite usar storage para passar dados ao servidor
- Passe dados necessários diretamente nos eventos
- Limpe dados obsoletos

## Comunicação

### 1. Cliente para Servidor
```javascript
// No client.js
CONTEXT.ioEmit('evento', {
    dados: valor,
    outrosDados: outroValor
});
```

### 2. Servidor para Cliente(s)
```javascript
// No index.js
IOEVENTS: {
    "evento": {
        description: "Descrição do evento",
        _function: (data) => {
            // Para um cliente específico
            WSIO.to(ID).emit('resposta', data);
            
            // Para todos os clientes
            WSIO.emit('broadcast', data);
        }
    }
}
```

### 3. Acesso a Outras Extensões
```javascript
// No client.js - Acesso assíncrono
const extension = await WSACTION.CONTEXT_MANAGER.getExtension("NOME_EXTENSAO");
await extension.PUBLIC.metodo();
```

## Exemplos Completos

### 1. Extensão Básica

```javascript
// meta.json
{
    "name": "MinhaExtensao",
    "version": "1.0.0",
    "WEB_SCRIPTS": ["client.js"]
}

// index.js
module.exports = ({WSIO, APP, RL, STORAGE, EXPRESS, WEB_SCRIPTS, EXTENSION_PATH, ID}) => {
    const ENABLED = true;
    const NAME = "MINHAEXTENSAO";
    const CLIENT_LINK = `${NAME}/client`;
    const ROUTER = EXPRESS.Router();

    const IOEVENTS = {
        "getData": {
            description: "Busca dados",
            _function: async (data) => {
                try {
                    const result = await processData(data);
                    WSIO.to(ID).emit('dataResult', result);
                } catch (error) {
                    WSIO.to(ID).emit('error', { message: error.message });
                }
            }
        }
    };

    return {
        NAME, ROUTER, ENABLED, IOEVENTS,
        CLIENT_LINK, EXTENSION_PATH, WEB_SCRIPTS, ID
    };
};

// client.js
(async function (EXTENSION_ID, SHARED_CONTEXT) {
    const CONTEXT = createContext("MINHAEXTENSAO", EXTENSION_ID);
    const SOCKET = CONTEXT.SOCKET;

    let STATE = {
        isActive: false,
        data: null
    };

    SOCKET.on('connect', () => {
        console.log('Connected');
        initializeExtension();
    });

    SOCKET.on('dataResult', async (data) => {
        STATE.data = data;
        await updateUI(data);
    });

    CONTEXT.KEYBOARD_COMMANDS = [
        {
            description: "Ativar",
            keys: [
                { key: "ctrlKey", uppercase: false },
                { key: "altKey", uppercase: false },
                { key: "a", uppercase: false }
            ],
            function: async () => {
                await toggleFunction();
            }
        }
    ];

    CONTEXT.PUBLIC = {
        isActive: () => STATE.isActive,
        getData: () => STATE.data,
        
        async processData(data) {
            CONTEXT.ioEmit('getData', data);
        }
    };

    async function initializeExtension() {
        // Carregar configurações do perfil
        const config = await CONTEXT.getStorage('config');
        if (config) {
            STATE.data = config;
        }

        // Carregar dados globais
        const globalData = await CONTEXT.getVariable('globalConfig', {}, true);
        
        // Inicializar
        STATE.isActive = true;
    }

    await CONTEXT.register();
})(EXTENSION_ID, SHARED_CONTEXT);
```

### 2. Gerenciamento de Estado e UI

```javascript
// No client.js
CONTEXT.PUBLIC = {
    async showInterface() {
        const result = await Swal.fire({
            title: 'Configuração',
            html: `
                <div class="form-group">
                    <label>Opção</label>
                    <input id="option1" class="swal2-input">
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Salvar'
        });

        if (result.isConfirmed) {
            const option = document.getElementById('option1').value;
            
            // Salvar no perfil
            await CONTEXT.setStorage('options', { option });
            
            // Salvar global
            await CONTEXT.setVariable('globalOptions', { option }, true);
            
            // Notificar servidor
            CONTEXT.ioEmit('optionsUpdated', { option });
        }
    }
};
```

## Boas Práticas

1. **Organização**
   - Use nomes descritivos em maiúsculas
   - Mantenha estado em objeto centralizado
   - Documente funções públicas

2. **Comunicação**
   - Passe dados necessários nos eventos
   - Use broadcast com moderação
   - Valide dados recebidos

3. **Storage**
   - Use perfil para dados individuais
   - Use global para dados compartilhados
   - Limpe dados não utilizados

4. **Interface**
   - Use SweetAlert2 para modais
   - Forneça feedback visual
   - Mantenha consistência visual

5. **Segurança**
   - Valide dados de entrada
   - Evite dados sensíveis
   - Use HTTPS quando necessário

## Notas Finais

1. **Ciclo de Vida**
   - Inicialização: Criar contexto e configurar eventos
   - Execução: Gerenciar estado e comunicação
   - Finalização: Limpar recursos e salvar estado

2. **Debug**
   - Use console.log com moderação
   - Trate erros adequadamente
   - Forneça feedback ao usuário

3. **Performance**
   - Evite polling desnecessário
   - Use armazenamento local quando possível
   - Limpe listeners não utilizados

4. **Compatibilidade**
   - Verifique versão mínima requerida
   - Teste em diferentes versões do WSActions
   - Mantenha retrocompatibilidade quando possível
