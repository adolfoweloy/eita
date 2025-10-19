import json
import requests
import sys

# Get the prompt from command line arguments
if len(sys.argv) < 2:
    print("Usage: python simple_request.py '<your question>'")
    print("Example: python simple_request.py 'Explain REST APIs in one sentence'")
    sys.exit(1)

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

