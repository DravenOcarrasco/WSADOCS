# Gerenciador de Contextos (CONTEXT_MANAGER)

## Menu Rápido
- [Visão Geral](#visão-geral)
- [API de Referência](#api-de-referência)
  - [Gerenciamento de Extensões](#gerenciamento-de-extensões)
  - [Sistema de Eventos](#sistema-de-eventos)
- [Exemplos Práticos](#exemplos-práticos)
- [Melhores Práticas](#melhores-práticas)

## Visão Geral

O Gerenciador de Contextos (`CONTEXT_MANAGER`) é um componente central do WSAction, disponível globalmente como `window.WSACTION`. Ele é responsável por:

- 🔄 Gerenciar o ciclo de vida das extensões
- 📡 Facilitar a comunicação entre extensões
- 🎯 Controlar eventos do sistema
- 🔍 Fornecer acesso a extensões carregadas

## API de Referência

### Gerenciamento de Extensões

#### `addExtension(name, context)`
Registra uma nova extensão no sistema.

```javascript
// Exemplo de uso interno
WSACTION.addExtension('MINHA-EXTENSAO', contexto);
```

#### `getExtension(name)`
Recupera uma extensão carregada pelo nome.

```javascript
// Recuperar uma extensão
const minhaExtensao = WSACTION.getExtension('MINHA-EXTENSAO');
if (minhaExtensao) {
    await minhaExtensao.PUBLIC.algumaFuncao();
}
```

#### `awaitExtension(name, timeout = 5000)`
Aguarda até que uma extensão específica seja carregada.

```javascript
// Aguardar carregamento de extensão
try {
    const extensao = await WSACTION.awaitExtension('MINHA-EXTENSAO', 10000);
    console.log('Extensão carregada:', extensao);
} catch (error) {
    console.error('Timeout ao aguardar extensão');
}
```

#### `isExtensionLoaded(context)`
Verifica se uma extensão específica está carregada.

```javascript
// Verificar se extensão está carregada
const estaCarregada = WSACTION.isExtensionLoaded('MINHA-EXTENSAO');
console.log('Extensão carregada:', estaCarregada);
```

### Sistema de Eventos

#### `on(event, listener)`
Registra um ouvinte para um evento específico.

```javascript
// Registrar listener para evento
WSACTION.on('extensionLoaded', (extensao) => {
    console.log('Nova extensão carregada:', extensao);
});
```

#### `off(event, listener)`
Remove um ouvinte de evento específico.

```javascript
// Remover listener específico
const meuListener = (data) => console.log(data);
WSACTION.off('extensionLoaded', meuListener);
```

#### `emit(event, data)`
Emite um evento com dados específicos.

```javascript
// Emitir evento
WSACTION.emit('meuEvento', { dados: 'valor' });
```

## Exemplos Práticos

### 1. Integração entre Extensões

```javascript
// Extensão A
const CONTEXT = createModuleContext("EXTENSAO-A");

CONTEXT.PUBLIC = {
    async getData() {
        return { valor: 42 };
    }
};

await CONTEXT.register();

// Extensão B
const CONTEXT = createModuleContext("EXTENSAO-B");

async function usarExtensaoA() {
    try {
        const extensaoA = await WSACTION.awaitExtension('EXTENSAO-A');
        const dados = await extensaoA.PUBLIC.getData();
        console.log('Dados da Extensão A:', dados);
    } catch (error) {
        console.error('Erro ao usar Extensão A:', error);
    }
}

await CONTEXT.register();
```

### 2. Sistema de Notificações entre Extensões

```javascript
// Extensão de Notificações
const CONTEXT = createModuleContext("NOTIFICACOES");

CONTEXT.PUBLIC = {
    showNotification(message) {
        Swal.fire({
            title: 'Notificação',
            text: message,
            icon: 'info'
        });
    }
};

// Registrar listener global
WSACTION.on('showNotification', (data) => {
    CONTEXT.PUBLIC.showNotification(data.message);
});

await CONTEXT.register();

// Outra Extensão
const outraExtensao = createModuleContext("OUTRA-EXTENSAO");

function notificarUsuario() {
    WSACTION.emit('showNotification', {
        message: 'Ação completada com sucesso!'
    });
}
```

### 3. Carregamento Condicional

```javascript
async function inicializarModulo() {
    try {
        // Aguardar dependências
        const [extensaoA, extensaoB] = await Promise.all([
            WSACTION.awaitExtension('EXTENSAO-A'),
            WSACTION.awaitExtension('EXTENSAO-B')
        ]);

        // Configurar após carregamento
        await setupModulo(extensaoA, extensaoB);
    } catch (error) {
        console.error('Erro ao inicializar:', error);
    }
}
```

## Melhores Práticas

1. **Gerenciamento de Dependências**
```javascript
// Usar awaitExtension para dependências
async function initializeWithDependencies() {
    try {
        const dependencia = await WSACTION.awaitExtension('DEPENDENCIA');
        // Continuar inicialização
    } catch (error) {
        console.error('Falha ao carregar dependência');
        // Tratar erro apropriadamente
    }
}
```

2. **Limpeza de Eventos**
```javascript
// Remover listeners quando não mais necessários
function setupEventListeners() {
    const handler = (data) => console.log(data);
    WSACTION.on('evento', handler);
    
    // Retornar função de limpeza
    return () => WSACTION.off('evento', handler);
}
```

3. **Verificação de Disponibilidade**
```javascript
// Verificar se extensão está disponível antes de usar
function usarExtensao(nome) {
    if (WSACTION.isExtensionLoaded(nome)) {
        const extensao = WSACTION.getExtension(nome);
        // Usar extensão
    } else {
        console.warn(`Extensão ${nome} não está disponível`);
    }
}
```

4. **Comunicação entre Extensões**
```javascript
// Preferir eventos para comunicação desacoplada
WSACTION.emit('dadosAtualizados', { 
    origem: 'EXTENSAO-A',
    dados: { /* ... */ } 
});

// Ouvir eventos de outras extensões
WSACTION.on('dadosAtualizados', (data) => {
    if (data.origem !== 'MINHA-EXTENSAO') {
        // Processar dados de outras extensões
    }
});
```

5. **Timeout em Operações Assíncronas**
```javascript
// Usar timeout apropriado ao aguardar extensões
async function carregarComTimeout() {
    try {
        const extensao = await WSACTION.awaitExtension('EXTENSAO', 3000);
        return extensao;
    } catch (error) {
        console.error('Timeout ao carregar extensão');
        // Fornecer fallback ou notificar usuário
    }
}
