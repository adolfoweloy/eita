import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Todo, TodoList, TodoListSchema } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '..', 'data');
const DATA_FILE = join(DATA_DIR, 'todos.json');

async function ensureDataDir(): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

async function ensureDataFile(): Promise<void> {
  if (!existsSync(DATA_FILE)) {
    await writeFile(DATA_FILE, JSON.stringify({ todos: [] }, null, 2));
  }
}

export async function loadTodos(): Promise<Todo[]> {
  await ensureDataDir();
  await ensureDataFile();

  const data = await readFile(DATA_FILE, 'utf-8');
  const parsed = JSON.parse(data);
  const todoList = TodoListSchema.parse(parsed);
  return todoList.todos;
}

export async function saveTodos(todos: Todo[]): Promise<void> {
  await ensureDataDir();

  const todoList: TodoList = { todos };
  await writeFile(DATA_FILE, JSON.stringify(todoList, null, 2));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function createTodo(title: string, description?: string): Promise<Todo> {
  const todos = await loadTodos();
  const now = new Date().toISOString();

  const newTodo: Todo = {
    id: generateId(),
    title,
    description,
    completed: false,
    createdAt: now,
    updatedAt: now
  };

  todos.push(newTodo);
  await saveTodos(todos);

  return newTodo;
}

export async function getTodos(filter?: 'all' | 'completed' | 'pending'): Promise<Todo[]> {
  const todos = await loadTodos();

  if (!filter || filter === 'all') {
    return todos;
  }

  if (filter === 'completed') {
    return todos.filter(todo => todo.completed);
  }

  if (filter === 'pending') {
    return todos.filter(todo => !todo.completed);
  }

  return todos;
}

export async function getTodoById(id: string): Promise<Todo | null> {
  const todos = await loadTodos();
  return todos.find(todo => todo.id === id) || null;
}

export async function updateTodo(
  id: string,
  updates: { title?: string; description?: string; completed?: boolean }
): Promise<Todo | null> {
  const todos = await loadTodos();
  const index = todos.findIndex(todo => todo.id === id);

  if (index === -1) {
    return null;
  }

  const updatedTodo: Todo = {
    ...todos[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  todos[index] = updatedTodo;
  await saveTodos(todos);

  return updatedTodo;
}

export async function deleteTodo(id: string): Promise<boolean> {
  const todos = await loadTodos();
  const index = todos.findIndex(todo => todo.id === id);

  if (index === -1) {
    return false;
  }

  todos.splice(index, 1);
  await saveTodos(todos);

  return true;
}

export async function markComplete(id: string): Promise<Todo | null> {
  return updateTodo(id, { completed: true });
}

export async function markIncomplete(id: string): Promise<Todo | null> {
  return updateTodo(id, { completed: false });
}
