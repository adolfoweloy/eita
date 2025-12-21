import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerCreateTodo } from './createTodo.js';
import { registerListTodos } from './listTodos.js';
import { registerUpdateTodo } from './updateTodo.js';
import { registerDeleteTodo } from './deleteTodo.js';
import { registerMarkComplete } from './markComplete.js';
import { registerMarkIncomplete } from './markIncomplete.js';

export function registerAllTools(server: McpServer) {
  registerCreateTodo(server);
  registerListTodos(server);
  registerUpdateTodo(server);
  registerDeleteTodo(server);
  registerMarkComplete(server);
  registerMarkIncomplete(server);
}
