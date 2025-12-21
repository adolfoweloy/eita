import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getTodoById } from '../storage.js';

export function registerTodoItem(server: McpServer) {
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
}
