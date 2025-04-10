import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import fetch from 'node-fetch'; // Use node-fetch explicitly
import FormData from 'form-data';
import fs from 'fs';

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

    const tools = await client.listTools();
    console.log("Tools disponíveis:", tools);

    // Listar recursos disponíveis
    const resources = await client.listResources();
    console.log("Recursos disponíveis:", resources);

    // Ler o recurso de usuários
    const content = await client.readResource({ uri: "api://users" });
    console.log("\nLista de Usuários:", content);

    // Chamando o callTool
    const toolResult = await client.callTool({ name: "Users Tool", arguments: {} });
    console.log("\nResultado da tool (callTool):", toolResult);

    // Opção 1: Usando o MCP Textract Tool (recomendado)
    try {
      const filePath = '/caminho/para/imagem.jpg';
      // Verificar se o arquivo existe antes de enviá-lo
      if (fs.existsSync(filePath)) {
        const textractToolResult = await client.callTool({ 
          name: "Textract Tool", 
          arguments: { filePath } 
        });
        console.log("\nResultado do Textract via MCP Tool:", textractToolResult);
      } else {
        console.log(`Arquivo não encontrado: ${filePath}`);
      }
    } catch (textractError) {
      console.error("Erro ao usar Textract Tool via MCP:", textractError);
    }

    // Opção 2: Enviando diretamente para o API endpoint (alternativa)
    try {
      const form = new FormData();
      const filePath = '/caminho/para/imagem.jpg';
      
      // Verificar se o arquivo existe
      if (fs.existsSync(filePath)) {
        form.append('file', fs.createReadStream(filePath));

        const response = await fetch('http://3.238.149.189:8080/api/textract/analyze', {
          method: 'POST',
          body: form as any, // Usar type assertion para resolver o erro de TypeScript
          headers: form.getHeaders(),
        });

        if (!response.ok) {
          throw new Error(`Erro ao enviar imagem: ${response.statusText}`);
        }

        const textractResult = await response.json();
        console.log("\nResultado do Textract via API direta:", textractResult);
      } else {
        console.log(`Arquivo não encontrado: ${filePath}`);
      }
    } catch (directApiError) {
      console.error("Erro ao chamar API diretamente:", directApiError);
    }

  } catch (error) {
    console.error("Erro ao executar o cliente:", error);
  }
}

main().catch(console.error);