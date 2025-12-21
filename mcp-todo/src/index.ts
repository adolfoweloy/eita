#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import {
  createTodo,
  getTodos,
  getTodoById,
  updateTodo,
  deleteTodo,
  markComplete,
  markIncomplete,
} from './storage.js';
import {
  CreateTodoArgsSchema,
  ListTodosArgsSchema,
  UpdateTodoArgsSchema,
  TodoIdArgsSchema,
} from './types.js';

const server = new Server(
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

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create_todo',
        description: 'Create a new todo item',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'The title of the todo item',
            },
            description: {
              type: 'string',
              description: 'Optional description for the todo item',
            },
          },
          required: ['title'],
        },
      },
      {
        name: 'list_todos',
        description: 'List all todos or filter by completion status',
        inputSchema: {
          type: 'object',
          properties: {
            filter: {
              type: 'string',
              enum: ['all', 'completed', 'pending'],
              description: 'Filter todos by status (default: all)',
            },
          },
        },
      },
      {
        name: 'update_todo',
        description: 'Update a todo item',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The ID of the todo to update',
            },
            title: {
              type: 'string',
              description: 'New title for the todo',
            },
            description: {
              type: 'string',
              description: 'New description for the todo',
            },
            completed: {
              type: 'boolean',
              description: 'Whether the todo is completed',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'delete_todo',
        description: 'Delete a todo item',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The ID of the todo to delete',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'mark_complete',
        description: 'Mark a todo as completed',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The ID of the todo to mark as complete',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'mark_incomplete',
        description: 'Mark a todo as incomplete',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'The ID of the todo to mark as incomplete',
            },
          },
          required: ['id'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    return {
      content: [
        {
          type: 'text',
          text: 'No arguments provided',
        },
      ],
      isError: true,
    };
  }

  try {
    switch (name) {
      case 'create_todo': {
        const result = CreateTodoArgsSchema.safeParse(args);
        if (!result.success) {
          return {
            content: [
              {
                type: 'text',
                text: `Invalid arguments: ${result.error.message}`,
              },
            ],
            isError: true,
          };
        }
        const todo = await createTodo(result.data.title, result.data.description);
        return {
          content: [
            {
              type: 'text',
              text: `Todo created successfully:\n${JSON.stringify(todo, null, 2)}`,
            },
          ],
        };
      }

      case 'list_todos': {
        const result = ListTodosArgsSchema.safeParse(args);
        if (!result.success) {
          return {
            content: [
              {
                type: 'text',
                text: `Invalid arguments: ${result.error.message}`,
              },
            ],
            isError: true,
          };
        }
        const todos = await getTodos(result.data.filter);
        return {
          content: [
            {
              type: 'text',
              text: `Found ${todos.length} todo(s):\n${JSON.stringify(todos, null, 2)}`,
            },
          ],
        };
      }

      case 'update_todo': {
        const result = UpdateTodoArgsSchema.safeParse(args);
        if (!result.success) {
          return {
            content: [
              {
                type: 'text',
                text: `Invalid arguments: ${result.error.message}`,
              },
            ],
            isError: true,
          };
        }
        const { id, ...updates } = result.data;
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

      case 'delete_todo': {
        const result = TodoIdArgsSchema.safeParse(args);
        if (!result.success) {
          return {
            content: [
              {
                type: 'text',
                text: `Invalid arguments: ${result.error.message}`,
              },
            ],
            isError: true,
          };
        }
        const success = await deleteTodo(result.data.id);
        if (!success) {
          return {
            content: [
              {
                type: 'text',
                text: `Todo with ID ${result.data.id} not found`,
              },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: `Todo with ID ${result.data.id} deleted successfully`,
            },
          ],
        };
      }

      case 'mark_complete': {
        const result = TodoIdArgsSchema.safeParse(args);
        if (!result.success) {
          return {
            content: [
              {
                type: 'text',
                text: `Invalid arguments: ${result.error.message}`,
              },
            ],
            isError: true,
          };
        }
        const todo = await markComplete(result.data.id);
        if (!todo) {
          return {
            content: [
              {
                type: 'text',
                text: `Todo with ID ${result.data.id} not found`,
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

      case 'mark_incomplete': {
        const result = TodoIdArgsSchema.safeParse(args);
        if (!result.success) {
          return {
            content: [
              {
                type: 'text',
                text: `Invalid arguments: ${result.error.message}`,
              },
            ],
            isError: true,
          };
        }
        const todo = await markIncomplete(result.data.id);
        if (!todo) {
          return {
            content: [
              {
                type: 'text',
                text: `Todo with ID ${result.data.id} not found`,
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

      default:
        return {
          content: [
            {
              type: 'text',
              text: `Unknown tool: ${name}`,
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: 'todo://list',
        name: 'All Todos',
        description: 'List of all todo items',
        mimeType: 'application/json',
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  if (uri === 'todo://list') {
    const todos = await getTodos();
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(todos, null, 2),
        },
      ],
    };
  }

  const todoIdMatch = uri.match(/^todo:\/\/todo\/(.+)$/);
  if (todoIdMatch) {
    const todoId = todoIdMatch[1];
    const todo = await getTodoById(todoId);

    if (!todo) {
      throw new Error(`Todo with ID ${todoId} not found`);
    }

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(todo, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown resource URI: ${uri}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCP Todo Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
