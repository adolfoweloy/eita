# ollama-simple-agent

This prototype is a simple agent built on top of Ollama LLMs that can answer questions about some people's birthdays.


## Running the Project

### Prerequisites
- Install [Ollama](https://ollama.com/)
- Create a virtual environment in this project directory:
  ```bash
  cd ollama-simple-agent
  python -m venv .venv
  ```
- Activate the virtual environment:
  ```bash
  source .venv/bin/activate
  ```
- Install required dependencies:
  ```bash
  pip install -r requirements.txt
  ```

### Running the Agent
1. Start the Ollama server:
   ```bash
   ollama serve
   ```

2. Pull the required model (if not already available):
   ```bash
   ollama pull llama3.2:1b
   ```

3. Run the birthday agent with your question:
   ```bash
   python birthday_agent.py 'When was Albert Einstein born?'
   ```

**Alternative**: Run without activating the virtual environment (from within the project directory):
```bash
.venv/bin/python birthday_agent.py 'When was Marie Curie born?'
```

## How this works

The agent uses an Ollama LLM to analyze the user's prompt to determine if they are asking about someone's birthday or birth date. If so, it extracts the relevant names from the prompt and looks up their birthdays in a predefined database. Finally, it constructs a response with the requested information.

Here is the basic flow:
1. **Check Intent**: The agent first checks if the user's prompt is asking about birthdays using the LLM.
2. **Extract Names**: If the intent is confirmed, it extracts the names mentioned in the prompt using another LLM call.
3. **Lookup Birthdays**: It looks up the extracted names in a predefined birthday database.
4. **Construct Response**: Finally, it constructs a response with the birthday information.

