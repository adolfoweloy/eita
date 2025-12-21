import { z } from 'zod';

// Zod schemas
export const TodoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  completed: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const TodoListSchema = z.object({
  todos: z.array(TodoSchema),
});

// Tool argument schemas
export const CreateTodoArgsSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

export const ListTodosArgsSchema = z.object({
  filter: z.enum(['all', 'completed', 'pending']).optional(),
});

export const UpdateTodoArgsSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
});

export const TodoIdArgsSchema = z.object({
  id: z.string(),
});

// Inferred TypeScript types
export type Todo = z.infer<typeof TodoSchema>;
export type TodoList = z.infer<typeof TodoListSchema>;
export type CreateTodoArgs = z.infer<typeof CreateTodoArgsSchema>;
export type ListTodosArgs = z.infer<typeof ListTodosArgsSchema>;
export type UpdateTodoArgs = z.infer<typeof UpdateTodoArgsSchema>;
export type TodoIdArgs = z.infer<typeof TodoIdArgsSchema>;
