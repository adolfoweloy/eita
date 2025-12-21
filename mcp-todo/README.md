# mcp-todo

A Model Context Protocol (MCP) server that provides todo list management functionality with persistent file storage.

## Features

- Create, read, update, and delete todo items
- Mark todos as complete or incomplete
- Filter todos by completion status
- Persistent storage using JSON files
- MCP Resources for accessing todos via URIs

## Installation

```bash
npm install
```

This will install dependencies and build the TypeScript code.

## Usage

### Running the Server

The MCP server uses stdio transport and is designed to be run by MCP clients like Claude Code:

```bash
node build/index.js
```

### Testing with MCP Inspector

You can test the server using the MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node build/index.js
```

### Integration with Claude Code

Add this server to your Claude Code MCP settings:

**For macOS/Linux** (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "todo": {
      "command": "node",
      "args": ["/absolute/path/to/eita/mcp-todo/build/index.js"]
    }
  }
}
```

**For Windows** (`%APPDATA%\Claude\claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "todo": {
      "command": "node",
      "args": ["C:\\absolute\\path\\to\\eita\\mcp-todo\\build\\index.js"]
    }
  }
}
```

## Available Tools

### create_todo
Create a new todo item.

**Parameters:**
- `title` (required): The title of the todo item
- `description` (optional): Optional description for the todo item

**Example:**
```json
{
  "title": "Learn MCP",
  "description": "Study the Model Context Protocol documentation"
}
```

### list_todos
List all todos or filter by completion status.

**Parameters:**
- `filter` (optional): Filter todos by status (`all`, `completed`, `pending`)

**Example:**
```json
{
  "filter": "pending"
}
```

### update_todo
Update a todo item.

**Parameters:**
- `id` (required): The ID of the todo to update
- `title` (optional): New title for the todo
- `description` (optional): New description for the todo
- `completed` (optional): Whether the todo is completed

**Example:**
```json
{
  "id": "1735123456789-abc123",
  "title": "Updated title",
  "completed": true
}
```

### delete_todo
Delete a todo item.

**Parameters:**
- `id` (required): The ID of the todo to delete

**Example:**
```json
{
  "id": "1735123456789-abc123"
}
```

### mark_complete
Mark a todo as completed.

**Parameters:**
- `id` (required): The ID of the todo to mark as complete

**Example:**
```json
{
  "id": "1735123456789-abc123"
}
```

### mark_incomplete
Mark a todo as incomplete.

**Parameters:**
- `id` (required): The ID of the todo to mark as incomplete

**Example:**
```json
{
  "id": "1735123456789-abc123"
}
```

## Available Resources

### todo://list
Returns all todos as JSON.

### todo://todo/{id}
Returns a specific todo by ID as JSON.

## Data Storage

Todos are stored in `data/todos.json` in the following format:

```json
{
  "todos": [
    {
      "id": "1735123456789-abc123",
      "title": "Example todo",
      "description": "This is an example",
      "completed": false,
      "createdAt": "2025-12-21T09:30:00.000Z",
      "updatedAt": "2025-12-21T09:30:00.000Z"
    }
  ]
}
```

The data directory and file are automatically created when the server starts.

## Development

### Build
```bash
npm run build
```

### Watch Mode
```bash
npm run dev
```

### Project Structure

```
mcp-todo/
├── src/
│   ├── index.ts       # MCP server implementation
│   ├── storage.ts     # File-based storage manager
│   └── types.ts       # TypeScript type definitions
├── build/             # Compiled JavaScript (generated)
├── data/              # Todo storage (generated)
│   └── todos.json
├── package.json
├── tsconfig.json
└── README.md
```

## License

MIT
