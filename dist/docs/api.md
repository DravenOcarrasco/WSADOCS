# Documentação da API

Bem-vindo à documentação da API do **WSAction**. Esta documentação fornece uma visão geral dos endpoints disponíveis, como utilizá-los e onde encontrar informações adicionais.

## Sumário

- [Introdução](#introdução)
- [Autenticação](#autenticação)
- [Endpoints Principais](#endpoints-principais)
  - [Criar Ação](#criar-ação)
  - [Obter Ação](#obter-ação)
  - [Listar Ações](#listar-ações)
- [Tratamento de Erros](#tratamento-de-erros)
- [Recursos Adicionais](#recursos-adicionais)

## Introdução

A API do **WSAction** permite que você integre e automatize ações em sua aplicação. Antes de começar, certifique-se de ler o [Guia de Introdução](getting-started.md) para configurar seu ambiente.

## Autenticação

Todas as requisições à API devem incluir um token de autenticação.

- **Cabeçalho de Autenticação**:

  ```
  Authorization: Bearer SEU_TOKEN_DE_API
  ```

Para obter um token, visite a seção [Obter Token de API](features.md#obter-token-de-api).

## Endpoints Principais

### Criar Ação

- **Endpoint**: `POST /actions`
- **Descrição**: Cria uma nova ação.
- **Parâmetros**:

  | Parâmetro   | Tipo   | Obrigatório | Descrição            |
  |-------------|--------|-------------|----------------------|
  | `name`      | string | Sim         | Nome da ação         |
  | `type`      | string | Sim         | Tipo da ação         |
  | `payload`   | object | Não         | Dados da ação        |

- **Exemplo de Requisição**:

  ```json
  {
    "name": "Enviar Email",
    "type": "email",
    "payload": {
      "to": "usuario@example.com",
      "subject": "Bem-vindo!",
      "body": "Obrigado por se registrar."
    }
  }
  ```

### Obter Ação

- **Endpoint**: `GET /actions/{id}`
- **Descrição**: Retorna os detalhes de uma ação específica.
- **Parâmetros de Caminho**:

  | Parâmetro | Tipo   | Obrigatório | Descrição           |
  |-----------|--------|-------------|---------------------|
  | `id`      | string | Sim         | ID da ação          |

- **Exemplo de Resposta**:

  ```json
  {
    "id": "abc123",
    "name": "Enviar Email",
    "type": "email",
    "status": "completed",
    "created_at": "2023-10-15T12:34:56Z"
  }
  ```

### Listar Ações

- **Endpoint**: `GET /actions`
- **Descrição**: Lista todas as ações.
- **Parâmetros de Consulta**:

  | Parâmetro | Tipo    | Obrigatório | Descrição                 |
  |-----------|---------|-------------|---------------------------|
  | `page`    | integer | Não         | Número da página          |
  | `limit`   | integer | Não         | Itens por página          |

- **Exemplo de Resposta**:

  ```json
  {
    "actions": [
      {
        "id": "abc123",
        "name": "Enviar Email",
        "type": "email"
      },
      {
        "id": "def456",
        "name": "Gerar Relatório",
        "type": "report"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total_pages": 5
    }
  }
  ```

## Tratamento de Erros

Em caso de erro, a API retornará um código de status HTTP adequado e um objeto JSON contendo detalhes.

- **Exemplo de Resposta de Erro**:

  ```json
  {
    "error": {
      "code": "INVALID_PARAMETER",
      "message": "O parâmetro 'name' é obrigatório."
    }
  }
  ```

## Recursos Adicionais

- [Guia de Introdução](getting-started.md)
- [Funcionalidades Avançadas](features.md)
- [Perguntas Frequentes](faq.md)
- [Suporte](support.md)

---

Este exemplo é mais simples e inclui:

- **Tabelas** para listar os parâmetros de forma clara.
- **Links** para outros documentos, como `getting-started.md` e `features.md`.
- **Exemplos concisos** de requisições e respostas.
- **Sumário** para facilitar a navegação no documento.