#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
  markComplete,
  markIncomplete,
} from './storage.js';

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

// Register tools using the high-level API
server.registerTool(
  'create_todo',
  {
    description: 'Create a new todo item',
    inputSchema: z.object({
      title: z.string().min(1, 'Title is required'),
      description: z.string().optional(),
    }),
  },
  async (args) => {
    const todo = await createTodo(args.title, args.description);
    return {
      content: [
        {
          type: 'text',
          text: `Todo created successfully:\n${JSON.stringify(todo, null, 2)}`,
        },
      ],
    };
  }
);

server.registerTool(
  'list_todos',
  {
    description: 'List all todos or filter by completion status',
    inputSchema: z.object({
      filter: z.enum(['all', 'completed', 'pending']).optional(),
    }),
  },
  async (args) => {
    const todos = await getTodos(args.filter);
    return {
      content: [
        {
          type: 'text',
          text: `Found ${todos.length} todo(s):\n${JSON.stringify(todos, null, 2)}`,
        },
      ],
    };
  }
);

server.registerTool(
  'update_todo',
  {
    description: 'Update a todo item',
    inputSchema: z.object({
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      completed: z.boolean().optional(),
    }),
  },
  async (args) => {
    const { id, ...updates } = args;
    const todo = await updateTodo(id, updates);
    if (!todo) {
      return {
        content: [
          {
            type: 'text',
            text: `Todo with ID ${id} not found`,
          },
        ],
        isError: true,
      };
    }
    return {
      content: [
        {
          type: 'text',
          text: `Todo updated successfully:\n${JSON.stringify(todo, null, 2)}`,
        },
      ],
    };
  }
);

server.registerTool(
  'delete_todo',
  {
    description: 'Delete a todo item',
    inputSchema: z.object({
      id: z.string(),
    }),
  },
  async (args) => {
    const success = await deleteTodo(args.id);
    if (!success) {
      return {
        content: [
          {
            type: 'text',
            text: `Todo with ID ${args.id} not found`,
          },
        ],
        isError: true,
      };
    }
    return {
      content: [
        {
          type: 'text',
          text: `Todo with ID ${args.id} deleted successfully`,
        },
      ],
    };
  }
);

server.registerTool(
  'mark_complete',
  {
    description: 'Mark a todo as completed',
    inputSchema: z.object({
      id: z.string(),
    }),
  },
  async (args) => {
    const todo = await markComplete(args.id);
    if (!todo) {
      return {
        content: [
          {
            type: 'text',
            text: `Todo with ID ${args.id} not found`,
          },
        ],
        isError: true,
      };
    }
    return {
      content: [
        {
          type: 'text',
          text: `Todo marked as complete:\n${JSON.stringify(todo, null, 2)}`,
        },
      ],
    };
  }
);

server.registerTool(
  'mark_incomplete',
  {
    description: 'Mark a todo as incomplete',
    inputSchema: z.object({
      id: z.string(),
    }),
  },
  async (args) => {
    const todo = await markIncomplete(args.id);
    if (!todo) {
      return {
        content: [
          {
            type: 'text',
            text: `Todo with ID ${args.id} not found`,
          },
        ],
        isError: true,
      };
    }
    return {
      content: [
        {
          type: 'text',
          text: `Todo marked as incomplete:\n${JSON.stringify(todo, null, 2)}`,
        },
      ],
    };
  }
);

// Register resources
server.registerResource(
  'todo-list',
  'todo://list',
  {
    description: 'List of all todo items',
    mimeType: 'application/json',
  },
  async () => {
    const todos = await getTodos();
    return {
      contents: [
        {
          uri: 'todo://list',
          mimeType: 'application/json',
          text: JSON.stringify(todos, null, 2),
        },
      ],
    };
  }
);

server.registerResource(
  'todo-item',
  { uriTemplate: 'todo://todo/{id}' } as any,
  {
    description: 'A specific todo item by ID',
    mimeType: 'application/json',
  },
  async (uri: URL, variables: Record<string, string | string[]>) => {
    const id = Array.isArray(variables.id) ? variables.id[0] : variables.id;
    const todo = await getTodoById(id);
    if (!todo) {
      throw new Error(`Todo with ID ${id} not found`);
    }
    return {
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(todo, null, 2),
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Todo Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
