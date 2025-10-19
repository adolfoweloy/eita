import json
import requests
import sys

# Get the prompt from command line arguments or file
if len(sys.argv) < 2:
    print("Usage:")
    print("  python simple_request.py '<your question>'")
    print("  python simple_request.py --file <filename>")
    print("Examples:")
    print("  python simple_request.py 'Explain REST APIs in one sentence'")
    print("  python simple_request.py --file prompt.txt")
    sys.exit(1)

# Check if loading from file
if sys.argv[1] == '--file' or sys.argv[1] == '-f':
    if len(sys.argv) < 3:
        print("Error: Please specify a filename after --file")
        print("Usage: python simple_request.py --file <filename>")
        sys.exit(1)
    
    filename = sys.argv[2]
    try:
        with open(filename, 'r', encoding='utf-8') as file:
            prompt = file.read().strip()
        print(f"Loaded prompt from file: {filename}")
        print(f"Prompt content: {prompt[:100]}{'...' if len(prompt) > 100 else ''}")
        print("-" * 50)
    except FileNotFoundError:
        print(f"Error: File '{filename}' not found.")
        sys.exit(1)
    except Exception as e:
        print(f"Error reading file '{filename}': {e}")
        sys.exit(1)
else:
    # Join all arguments after the script name to allow multi-word questions
    prompt = ' '.join(sys.argv[1:])

response = requests.post('http://localhost:11434/api/generate',
    json={
        'model': 'llama3.2:1b',
        'prompt': prompt
    })

# Extract the response body
if response.status_code == 200:
    # Ollama returns streaming JSON, so we need to parse each line
    # Collect all response pieces to build the complete answer
    complete_response = ""
    
    # Parse each line as separate JSON objects
    for line in response.text.strip().split('\n'):
        if line.strip():
            try:
                json_obj = json.loads(line)
                # Extract the actual generated text if available
                if 'response' in json_obj:
                    complete_response += json_obj['response']
            except json.JSONDecodeError as e:
                print(f"Could not parse line as JSON: {line}")
    
    print("Robota response:")
    print("=" * 50)
    print(complete_response)
else:
    print(f"Error: {response.status_code}")
    print("Response text:", response.text)

