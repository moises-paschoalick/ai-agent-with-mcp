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

  } catch (error) {
    console.error("Erro ao executar o cliente:", error);
  }
}

main().catch(console.error); 