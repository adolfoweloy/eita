import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createTodo } from '../storage.js';

export function registerCreateTodo(server: McpServer) {
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
}
