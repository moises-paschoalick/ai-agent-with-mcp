import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import FormData from "form-data";
import fs from "fs";
import { ListResourcesRequestSchema, ReadResourceRequestSchema, ListToolsRequestSchema, CallToolRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";
// Initialize server with resource capabilities
const server = new Server({
    name: "hello-mcp",
    version: "1.0.0",
}, {
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
            "api://textract": {
                name: "Textract Tool",
                description: "Sends an image to the Textract API for analysis",
                inputSchema: {
                    type: "object",
                    properties: {
                        filePath: {
                            type: "string",
                            description: "The local path to the image file to be uploaded",
                        },
                    },
                    required: ["filePath"],
                },
            }
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
            "api://textract": {
                name: "Textract Tool",
                description: "Sends an image to the Textract API for analysis",
                mimeType: "multipart/form-data",
            }
        },
    },
});
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
        {
            uri: "api://textract",
            name: "Textract Tool",
            description: "Sends an image to the Textract API for analysis",
            inputSchema: {
                type: "object",
                properties: {
                    filePath: {
                        type: "string",
                        description: "The local path to the image file to be uploaded",
                    },
                },
                required: ["filePath"],
            },
        }
    ],
}));
// Implementação da execução das tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name } = request.params;
    if (name === "Hello Tool") {
        return {
            content: [
                {
                    type: "text",
                    text: "Hello, World! This is a tool response!",
                },
            ],
        };
    }
    if (name === "Users Tool") {
        try {
            const response = await fetch("http://3.238.149.189:8080/users");
            const data = await response.json();
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(data, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Failed to fetch users: ${error?.message || "Unknown error"}`);
        }
    }
    if (name === "Textract Tool") {
        const { filePath } = request.params.arguments;
        const form = new FormData();
        form.append("file", fs.createReadStream(filePath));
        try {
            // Fixed FormData type compatibility issue
            const response = await fetch("http://3.238.149.189:8080/api/textract/analyze", {
                method: "POST",
                body: form, // Type assertion to resolve the TypeScript error
                headers: form.getHeaders(),
            });
            const result = await response.text();
            return {
                content: [
                    {
                        type: "text",
                        text: result,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Textract upload failed: ${error?.message || "Unknown error"}`);
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
        }
        catch (error) {
            throw new Error(`Failed to fetch users: ${error?.message || 'Unknown error'}`);
        }
    }
    throw new Error("Resource not found");
});
// Start server using stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
console.info('{"jsonrpc": "2.0", "method": "log", "params": { "message": "Server running..." }}');
