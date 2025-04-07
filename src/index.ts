import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Initialize server with resource capabilities
const server = new Server(
  {
    name: "hello-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {      
       // Tools visíveis no "tool list"
       tools: {
        "hello://world": {
          name: "Hello Tool",
          description: "Responds with a hello world message",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        "api://users": {
          name: "Users Tool",
          description: "Fetches a list of users from an external API",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
      },
      resources: {
        "hello://world": {
          name: "Hello World Message",
          description: "A simple greeting message",
          mimeType: "text/plain",
        },
        "api://users": {
          name: "Users List",
          description: "List of users from external API",
          mimeType: "application/json",
        },
      },
    },
  }
);

// Implementação da listagem de tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      uri: "hello://world",
      name: "Hello Tool",
      description: "Responds with a hello world message",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      uri: "api://users",
      name: "Users Tool",
      description: "Fetches a list of users from an external API",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
  ],
}));

// Implementação da execução das tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.uri === "hello://world") {
    return {
      result: {
        type: "text",
        text: "Hello, World! This is a tool response!",
      },
    };
  }

  if (request.params.uri === "api://users") {
    try {
      const response = await fetch("http://3.238.149.189:8080/users");
      const data = await response.json();
      return {
        result: {
          type: "text",
          text: JSON.stringify(data, null, 2),
        },
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch users: ${error?.message || "Unknown error"}`);
    }
  }

  throw new Error("Tool not found");
});


// List available resources when clients request them
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "hello://world",
        name: "Hello World Message",
        description: "A simple greeting message",
        mimeType: "text/plain",
      },
      {
        uri: "api://users",
        name: "Users List",
        description: "List of users from external API",
        mimeType: "application/json",
      }
    ],
  };
});
// Return resource content when clients request it
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  if (request.params.uri === "hello://world") {
    return {
      contents: [
        {
          uri: "hello://world",
          text: "Hello, World! This is my first MCP resource.",
        },
      ],
    };
  }
  
  if (request.params.uri === "api://users") {
    try {
      const response = await fetch("http://3.238.149.189:8080/users");
      const data = await response.json();
      return {
        contents: [
          {
            uri: "api://users",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch users: ${error?.message || 'Unknown error'}`);
    }
  }
  
  throw new Error("Resource not found");
});
// Start server using stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
console.info('{"jsonrpc": "2.0", "method": "log", "params": { "message": "Server running..." }}');