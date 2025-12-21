#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerAllTools } from './tools/index.js';
import { registerAllResources } from './resources/index.js';

const server = new McpServer(
  {
    name: 'mcp-todo',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Register all tools
registerAllTools(server);

// Register all resources
registerAllResources(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Todo Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
