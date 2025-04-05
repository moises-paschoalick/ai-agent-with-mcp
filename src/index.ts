import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Initialize server with resource capabilities
const server = new Server(
  {
    name: "hello-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {}, // Enable resources
    },
  }
);
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