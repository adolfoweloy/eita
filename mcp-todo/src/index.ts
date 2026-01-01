#!/usr/bin/env node

import express from 'express';
import { IncomingMessage, ServerResponse } from 'http';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { randomUUID } from 'crypto';
import { registerAllTools } from './tools/index.js';
import { registerAllResources } from './resources/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Map to store transports by session ID (for stateful mode)
const transports: Record<string, StreamableHTTPServerTransport> = {};

// Middleware
app.use(express.json());

// CORS - accept all origins
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Expose-Headers', '*');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
});

// Log all incoming JSONRPC payloads to /mcp
app.use((req, res, next) => {
  if (req.path === '/mcp' && req.method === 'POST' && req.body) {
    const sessionId = req.headers['mcp-session-id'];
    console.log('Incoming JSONRPC request:', JSON.stringify(req.body, null, 2));
    console.log('Session ID:', sessionId || 'None');
    console.log('Request headers:', JSON.stringify(req.headers, null, 2));

    // Log response status and headers after the response is sent
    res.on('finish', () => {
      console.log('Response status:', res.statusCode);
      console.log('Response headers:', JSON.stringify(res.getHeaders(), null, 2));
    });
  }
  next();
});

// Factory function to create a new MCP server instance for each session
const createServer = () => {
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

  return server;
};

// Basic health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// MCP POST endpoint with stateful session management
app.post('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;

  try {
    let transport: StreamableHTTPServerTransport;

    if (sessionId && transports[sessionId]) {
      // Reuse existing transport for this session
      transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      // New initialization request - create new transport and server
      console.log('Creating new transport for initialization request');
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => {
          const sid = randomUUID();
          console.log(`Generated session ID: ${sid}`);
          return sid;
        },
        onsessioninitialized: (sessionId: string) => {
          console.log(`Session initialized callback with ID: ${sessionId}`);
          transports[sessionId] = transport;
        }
      });

      // Set up cleanup when transport closes
      transport.onclose = () => {
        const sid = transport.sessionId;
        if (sid && transports[sid]) {
          console.log(`Transport closed for session ${sid}`);
          delete transports[sid];
        }
      };

      // Create a new server instance and connect it to the transport
      const server = createServer();
      console.log('Connecting server to transport');
      await server.connect(transport);
      console.log('Server connected, transport.sessionId:', transport.sessionId);
    } else {
      // Invalid request - no session ID or not initialization request
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided'
        },
        id: null
      });
      return;
    }

    // Handle the request with the transport
    await transport.handleRequest(
      req as IncomingMessage & { auth?: any },
      res as ServerResponse,
      req.body
    );
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error'
        },
        id: null
      });
    }
  }
});

// MCP GET endpoint for SSE streams
app.get('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;

  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID');
    return;
  }

  const transport = transports[sessionId];
  await transport.handleRequest(req as IncomingMessage & { auth?: any }, res as ServerResponse);
});

async function main() {
  // Start Express server
  app.listen(PORT, () => {
    console.log(`Express server running on http://localhost:${PORT}`);
    console.log(`MCP HTTP endpoint available at http://localhost:${PORT}/mcp`);
    console.log('Running in STATEFUL mode - each client gets its own session');
  });
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
