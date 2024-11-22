# Como o Injetor Funciona

## Menu Rápido
- [Visão Geral](#visão-geral)
- [Componentes Principais](#componentes-principais)
- [Processo de Injeção](#processo-de-injeção)
- [Melhores Práticas](#melhores-práticas)

## Visão Geral

O Injetor WSAction é um componente fundamental que permite a integração dinâmica de extensões em páginas web. Ele atua como uma ponte entre o navegador e as extensões, gerenciando:

- 🔄 Carregamento dinâmico de scripts
- 🧩 Gerenciamento de extensões
- 🔌 Integração com o navegador
- 🎯 Execução de funcionalidades

## Componentes Principais

### 1. Gerenciador de Contexto
- Inicializa o objeto global `window.WSACTION`
- Gerencia o ciclo de vida das extensões
- Fornece APIs para comunicação entre extensões

### 2. Carregador de Bibliotecas
- Carrega bibliotecas essenciais como jQuery e SweetAlert2
- Gerencia dependências de forma assíncrona
- Garante carregamento único de recursos

### 3. Interface Visual
- Cria uma janela flutuante para gerenciar extensões
- Permite interação com extensões carregadas
- Fornece feedback visual sobre o estado das extensões

## Processo de Injeção

### 1. Inicialização
```javascript
// O injetor começa verificando se já está inicializado
if (!window.WSACTION) {
    window.WSACTION = {};
}

// Evita múltiplas inicializações
if (window.WSACTION.CONTEXT_MANAGER) {
    return;
}
```

### 2. Carregamento de Recursos
O injetor segue uma sequência específica:
1. Aguarda configuração inicial
2. Carrega bibliotecas essenciais
3. Inicializa o gerenciador de contexto
4. Carrega extensões habilitadas

### 3. Registro de Extensões
Cada extensão passa por um processo de registro:
1. Carregamento de recursos
2. Inicialização do contexto
3. Integração com a interface
4. Disponibilização de funcionalidades

## Melhores Práticas

### 1. Desenvolvimento de Extensões
- Use o módulo base fornecido
- Siga o padrão de eventos estabelecido
- Implemente tratamento de erros adequado

### 2. Performance
- Carregue recursos sob demanda
- Otimize o tamanho dos scripts
- Implemente cache quando apropriado

## Exemplo de Uso

### Carregamento de Extensão
```javascript
// Exemplo simplificado de como o injetor carrega uma extensão
async function loadExtension(extension) {
    // 1. Carregamento
    await loadExtensionResources(extension);

    // 2. Inicialização
    initializeExtension(extension);

    // 3. Registro
    registerInInterface(extension);
}
```

### Comunicação entre Extensões
```javascript
// Exemplo de como extensões se comunicam
CONTEXT.ioEmit('evento', { dados: 'valor' });

// Recebendo eventos
SOCKET.on('resposta', (data) => {
    // Processa resposta
});
```

## Considerações Finais

O Injetor WSAction é projetado para ser:
- 🚀 Eficiente em performance
- 🔄 Fácil de manter
- 🧩 Extensível conforme necessário

Ao desenvolver extensões ou interagir com o injetor, mantenha estas considerações em mente para garantir uma integração suave e eficiente.
