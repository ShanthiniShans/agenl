from flask import Flask, request, jsonify
import anthropic
import os
import re
from pathlib import Path
from dotenv import load_dotenv, dotenv_values

_here = Path(__file__).parent
_env_path = _here / '.env'

# load_dotenv may silently fail on files with no trailing newline;
# dotenv_values reads the file directly as a fallback
load_dotenv(dotenv_path=_env_path, override=True)
_env_vals = dotenv_values(_env_path)

API_KEY = os.getenv('ANTHROPIC_API_KEY') or _env_vals.get('ANTHROPIC_API_KEY')

if not API_KEY:
    print("ERROR: ANTHROPIC_API_KEY not found in .env or environment")
else:
    print(f"API key loaded: {API_KEY[:20]}...")

app = Flask(__name__, static_folder=str(_here / 'templates'), static_url_path='')

def to_snake(text):
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    words = text.strip().lower().split()[:3]
    return '_'.join(words)

def clean_tool_list(tools):
    if not isinstance(tools, list):
        return []
    cleaned = []
    for tool in tools:
        if isinstance(tool, str):
            if len(tool.split()) > 3:
                cleaned.append(to_snake(tool))
            else:
                cleaned.append(tool.lower().replace(' ', '_'))
    return cleaned[:6]

def clean_contract(parsed):
    if not isinstance(parsed, dict):
        return parsed
    parsed['allow'] = clean_tool_list(parsed.get('allow', []))
    parsed['block'] = clean_tool_list(parsed.get('block', []))
    parsed['confirm'] = clean_tool_list(parsed.get('confirm', []))
    if 'name' in parsed:
        parsed['name'] = ''.join(w.capitalize() for w in parsed['name'].split()[:3])
    if 'goal' in parsed:
        words = parsed['goal'].split()
        if len(words) > 12:
            parsed['goal'] = ' '.join(words[:12]) + '...'
    return parsed

@app.route('/')
def index():
    return app.send_static_file('agenl_dashboard.html')

@app.route('/api/convert', methods=['POST'])
def convert():
    import subprocess, json as json_lib

    data = request.json
    description = data.get('description', '')

    result = subprocess.run(
        ['/Users/shanthinishans/agenl/venv/bin/python3', '-m', 'agenl.cli',
         'convert', description],
        capture_output=True,
        text=True,
        cwd='/Users/shanthinishans/agenl',
        env={**os.environ, 'ANTHROPIC_API_KEY': os.getenv('ANTHROPIC_API_KEY')}
    )

    # Strip ANSI escape codes from rich console output
    output = re.sub(r'\x1b\[[0-9;]*m', '', result.stdout)

    match = re.search(r'agent \w+ \{.*?\}', output, re.DOTALL)

    if match:
        contract_text = match.group(0)

        name_match  = re.search(r'agent (\w+)', contract_text)
        goal_match  = re.search(r'goal:\s*"([^"]+)"', contract_text)
        allow_match = re.search(r'allow:\s*\[([^\]]+)\]', contract_text)
        block_match = re.search(r'block:\s*\[([^\]]+)\]', contract_text)
        confirm_match = re.search(r'confirm:\s*\[([^\]]+)\]', contract_text)
        trust_match = re.search(r'trust:\s*(\w+)', contract_text)
        uncertain_match = re.search(r'on_uncertain:\s*(\w+)', contract_text)
        error_match = re.search(r'on_error:\s*(\w+)', contract_text)

        def parse_list(m):
            if not m:
                return []
            items = m.group(1).split(',')
            return [i.strip().strip('"') for i in items if i.strip()]

        parsed = {
            "name":         name_match.group(1) if name_match else "Agent",
            "goal":         goal_match.group(1) if goal_match else "",
            "allow":        parse_list(allow_match),
            "block":        parse_list(block_match),
            "confirm":      parse_list(confirm_match),
            "trust":        trust_match.group(1) if trust_match else "low",
            "on_uncertain": uncertain_match.group(1) if uncertain_match else "escalate",
            "on_error":     error_match.group(1) if error_match else "escalate",
        }

        return jsonify({"result": parsed, "ok": True})

    return jsonify({"result": {}, "ok": False, "error": result.stderr or "No contract block found"})

if __name__ == '__main__':
    app.run(port=8080, debug=True)
