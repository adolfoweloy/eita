import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { updateTodo } from '../storage.js';

export function registerUpdateTodo(server: McpServer) {
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
}
