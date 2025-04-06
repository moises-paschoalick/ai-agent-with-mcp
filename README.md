# AI Agent with MCP

Este projeto implementa um agente de IA que utiliza o Model Context Protocol (MCP) para interagir com recursos externos.

## Recursos Disponíveis

O servidor MCP fornece os seguintes recursos:

### Recursos de Usuários
- **api://users**: Lista todos os usuários cadastrados no sistema
  - Retorna informações como ID, nome, número de telefone e thread ID
  - Formato: JSON
  - Exemplo de resposta:
    ```json
    {
      "content": [
        {
          "id": 1,
          "phoneNumber": "553496341404",
          "name": "Moisés Paschoalick",
          "threadId": "thread_bZEPVYVBvHxY9Ok6WqR63M2D"
        },
        {
          "id": 2,
          "phoneNumber": "553496338888",
          "name": "José Silva",
          "threadId": "1thread_t8SFjKio6yN9pppqypilwGoR__"
        },
        {
          "id": 3,
          "phoneNumber": "553496338889",
          "name": "Maria Antonia",
          "threadId": "1thread_t8SFjKio6yN9pppqypilwGoR__"
        }
      ],
      "pageable": {
        "pageNumber": 0,
        "pageSize": 12,
        "sort": {
          "empty": false,
          "sorted": true,
          "unsorted": false
        },
        "offset": 0,
        "paged": true,
        "unpaged": false
      },
      "last": true,
      "totalPages": 1,
      "totalElements": 3,
      "first": true,
      "size": 12,
      "number": 0,
      "sort": {
        "empty": false,
        "sorted": true,
        "unsorted": false
      },
      "numberOfElements": 3,
      "empty": false
    }
    ```

### Recursos de Mensagens
- **hello://world**: Retorna uma mensagem de saudação simples
  - Formato: texto plano (text/plain)
  - Exemplo de resposta: "Hello, World! This is my first MCP resource."

## Instalação para Cursor

Primeiro, certifique-se de que você tem o Cursor instalado e o npm configurado em seu sistema.

### Opção 1: Instalação via Terminal
Execute o seguinte comando no terminal:

```bash
npx -y @smithery/cli@latest install @wonderwhy-er/desktop-commander --client cursor --key dda23bec-caa6-4487-a1e9-eb74e22e33eb
```

Reinicie o Cursor se estiver em execução.

### Opção 2: Instalação Manual
Adicione a entrada apropriada ao seu arquivo mcp.json:

#### Para Mac/Linux:
No Linux: `~/.config/cursor.json`

```json
{
  "mcpServers": {
    "desktop-commander": {
      "command": "npx",
      "args": [
        "-y",
        "@smithery/cli@latest",
        "run",
        "@wonderwhy-er/desktop-commander",
        "--key",
        "dda23bec-caa6-4487-a1e9-eb74e22e33eb"
      ]
    }
  }
}
```

#### Para Windows:

```json
{
  "mcpServers": {
    "desktop-commander": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@smithery/cli@latest",
        "run",
        "@wonderwhy-er/desktop-commander",
        "--key",
        "dda23bec-caa6-4487-a1e9-eb74e22e33eb"
      ]
    }
  }
}
```

Reinicie o Cursor se estiver em execução.

### Opção 3: Clonar localmente
Clone e construa:

```bash
git clone https://github.com/moises-paschoalick/ai-agent-with-mcp.git
cd ai-agent-with-mcp
npm run setup
```

Reinicie o Cursor se estiver em execução.

O comando de configuração irá:
- Instalar dependências
- Construir o servidor
- Configurar o Cursor
- Adicionar servidores MCP à configuração do Cursor, se necessário

## Como Usar

### Cliente MCP

O projeto inclui um cliente MCP que pode ser usado para acessar os recursos disponíveis:

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  const client = new Client({
    name: "hello-mcp-client",
    version: "1.0.0"
  });
  const transport = new StdioClientTransport({
    command: "node",
    args: ["build/index.js"]
  });
  
  try {
    await client.connect(transport);
    
    // Listar recursos disponíveis
    const resources = await client.listResources();
    console.log("Recursos disponíveis:", resources);
    
    // Ler o recurso de usuários
    const content = await client.readResource({ uri: "api://users" });
    console.log("\nLista de Usuários:", content);
  } catch (error) {
    console.error("Erro ao executar o cliente:", error);
  }
}

main().catch(console.error);
```

### API REST Direta

Você também pode acessar os recursos diretamente via API REST:

```bash
# Listar todos os usuários
curl http://3.238.149.189:8080/users
```

## Instalação e Execução

```bash
# Instalar dependências
npm install

# Compilar o projeto
npm run build

# Executar o servidor
npm start

# Executar em modo de desenvolvimento
npm run dev
```

## Requisitos

- Node.js (versão compatível com AbortController)
- TypeScript
- @modelcontextprotocol/sdk
