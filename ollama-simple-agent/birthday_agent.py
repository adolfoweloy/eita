import json
import requests
import sys
import re

class BirthdayAgent:
    
    def check_birthday_intent_with_llm(self, prompt):
        """Use LLM to determine if the user is asking about someone's birthday/birth date"""
        intent_prompt = f"""Analyze the following user question and determine if they are asking about someone's birthday, birth date, or when someone was born (notice that they may use their own language instead of English).

User question: "{prompt}"

Answer with only "YES" if the user wants to know when someone was born or their birthday/birth date.
Answer with only "NO" if they are asking about anything else (theories, discoveries, achievements, etc.).

Answer:"""
        
        try:
            response = requests.post('http://localhost:11434/api/generate',
                json={
                    'model': 'llama3.2:1b',
                    'prompt': intent_prompt
                })
            
            if response.status_code == 200:
                complete_response = ""
                for line in response.text.strip().split('\n'):
                    if line.strip():
                        try:
                            json_obj = json.loads(line)
                            if 'response' in json_obj:
                                complete_response += json_obj['response']
                        except json.JSONDecodeError:
                            continue
                
                # Check if the response contains "YES"
                return "YES" in complete_response.upper()
        except Exception:
            print("Error: Failed to check birthday intent with LLM")
            sys.exit(1)

    
    def extract_names_from_prompt(self, prompt):
        # Use LLM to determine if there's birthday intent
        has_birthday_intent = self.check_birthday_intent_with_llm(prompt)
        
        if not has_birthday_intent:
            return []  # No birthday intent detected, return empty list
        
        print("Birthday intent detected in prompt.")
        # If birthday intent is detected, look for names
        known_names = [
            "Albert Einstein", "Isaac Newton", "Marie Curie", "Leonardo da Vinci",
            "William Shakespeare", "Nikola Tesla", "Charles Darwin", "Galileo Galilei", "Adolfo Eloy"
        ]
        
        found_names = []
        for name in known_names:
            if name.lower() in prompt.lower():
                found_names.append(name)
        
        # Also use regex to find patterns for names
        name_patterns = [
            r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)',  # Match capitalized names
        ]
        
        regex_matches = []
        for pattern in name_patterns:
            matches = re.findall(pattern, prompt)
            # Filter to only include names from our known list
            for match in matches:
                if match in known_names:
                    regex_matches.append(match)
        
        # Combine both methods and remove duplicates
        all_names = list(set(found_names + regex_matches))
        return all_names

    def get_birthday(self, name):
        # In a real implementation, this method would look up a database or API
        # Here we use a hardcoded dictionary for demonstration purposes
        birthdays = {
            "Albert Einstein": "March 14, 1879",
            "Isaac Newton": "January 4, 1643",
            "Marie Curie": "November 7, 1867",
            "Leonardo da Vinci": "April 15, 1452",
            "William Shakespeare": "April 23, 1564",
            "Nikola Tesla": "July 10, 1856",
            "Charles Darwin": "February 12, 1809",
            "Galileo Galilei": "February 15, 1564",
            "Adolfo Eloy": "December 28, 1979"
        }
        return birthdays.get(name, f"Birth date unknown for {name}")

# Get the prompt from command line arguments
if len(sys.argv) < 2:
    print("Usage: python birthday_agent.py '<your question>'")
    print("Example: python birthday_agent.py 'When was Albert Einstein born?'")
    print("Example: python birthday_agent.py 'birthday of Marie Curie'")
    sys.exit(1)

# Join all arguments after the script name to allow multi-word questions
user_prompt = ' '.join(sys.argv[1:])

# Initialize the birthday agent
birthday_agent = BirthdayAgent()

# Check if the prompt contains birthday requests
detected_names = birthday_agent.extract_names_from_prompt(user_prompt)

if detected_names:
    # If names are detected, use the BirthdayAgent.get_birthday method
    birthday_info = []
    for name in detected_names:
        birthday = birthday_agent.get_birthday(name)
        birthday_info.append(f"{name}: {birthday}")
    
    # Create a prompt that includes the birthday information
    birthday_data = "\n".join(birthday_info)
    agent_prompt = f"""You are a helpful assistant. The user asked about birthdays and I have retrieved the following birthday information using BirthdayAgent.get_birthday():

{birthday_data}

User question: {user_prompt}

Please provide a natural response incorporating this birthday information using the user's language."""
else:
    # If no birthday request detected, use a general prompt
    agent_prompt = f"""You are a helpful assistant. Answer the user's question naturally using the user's language.

User question: {user_prompt}

Response:"""

response = requests.post('http://localhost:11434/api/generate',
    json={
        'model': 'llama3.2:1b',
        'prompt': agent_prompt
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
    
    print("Birthday Agent Response:")
    print("=" * 50)
    if detected_names:
        print(f"[Used BirthdayAgent.get_birthday() for: {', '.join(detected_names)}]")
        print()
    print(complete_response.strip())
else:
    print(f"Error: {response.status_code}")
    print("Response text:", response.text)