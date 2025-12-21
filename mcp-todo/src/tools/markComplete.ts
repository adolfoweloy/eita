import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { markComplete } from '../storage.js';

export function registerMarkComplete(server: McpServer) {
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
}
