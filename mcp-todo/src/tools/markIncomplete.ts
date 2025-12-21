import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { markIncomplete } from '../storage.js';

export function registerMarkIncomplete(server: McpServer) {
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
}
