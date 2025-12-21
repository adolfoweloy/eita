import { z } from 'zod';

// Data model schemas
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

// Inferred TypeScript types
export type Todo = z.infer<typeof TodoSchema>;
export type TodoList = z.infer<typeof TodoListSchema>;
