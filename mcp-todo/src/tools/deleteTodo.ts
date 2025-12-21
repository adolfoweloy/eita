import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { deleteTodo } from '../storage.js';

export function registerDeleteTodo(server: McpServer) {
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
}
