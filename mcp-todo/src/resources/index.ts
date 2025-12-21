import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTodoList } from './todoList.js';
import { registerTodoItem } from './todoItem.js';

export function registerAllResources(server: McpServer) {
  registerTodoList(server);
  registerTodoItem(server);
}
