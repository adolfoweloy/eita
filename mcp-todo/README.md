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

### Integration with OpenWebUI

OpenWebUI is an open-source AI chat interface that supports MCP servers and is a good alternative to test MCP servers like this one locally when running on Linux. Usually for MacOS, Claude Desktop is easier to use.

The [Local Development Guide](https://docs.openwebui.com/getting-started/advanced-topics/development/) provides all the steps to setup and run OpenWebUI.

Before running OpenWebUI, you need a model that works well enough locally to test this MCP server project. I am using Ollama and the model that worked best for my limited laptop is what follows:

```bash
ollama run llama3.1:8b-instruct-q4_K_M
```

Once you have a valid model running, then the following steps should be enough to start Open WebUI:

Run the frontend from the root directory of OpenWebUI

```bash
npm run dev
```

Then run the backend

```bash
cd backend
./dev.sh
```

Once it is running, it can be accessed from `http://localhost:8080`. You will be prompted to create an account the first time you access it. 

Create the account and the model should be already selected if you have the Ollama server running. The next step then is to add this MCP server to OpenWebUI by following these steps:

1. Go to Settings by clicking on your user icon at the bottom left corner.
2. Select Admin Settings from the bottom left corner.
3. Go to External Tools
4. Add an external tool selecting the type as MCP Streamable HTTP, set the URL as `http://localhost:3000` and set the name as `Todo MCP Server` (or any name you prefer). That should be enough to add the MCP server to OpenWebUI.


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
