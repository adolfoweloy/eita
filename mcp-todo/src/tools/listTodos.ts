import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getTodos } from '../storage.js';

export function registerListTodos(server: McpServer) {
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
}
