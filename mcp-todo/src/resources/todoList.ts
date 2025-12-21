import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getTodos } from '../storage.js';

export function registerTodoList(server: McpServer) {
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
}
