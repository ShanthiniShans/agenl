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
    from agenl.converter import convert_to_agenl

    data = request.json
    description = data.get('description', '')

    try:
        output = convert_to_agenl(description)
    except Exception as e:
        return jsonify({"result": {}, "ok": False, "error": str(e)})

    def find(pattern, text, default=''):
        m = re.search(pattern, text, re.DOTALL)
        return m.group(1).strip() if m else default

    def parse_list(pattern, text):
        m = re.search(pattern, text)
        if not m:
            return []
        cleaned = []
        for item in m.group(1).split(','):
            item = item.strip().strip('"').strip()
            if not item:
                continue
            if ' ' not in item:
                # Already a token (snake_case or single word) — keep as-is
                cleaned.append(item.lower())
            else:
                # Sentence — take first 3 words as snake_case
                words = re.sub(r'[^a-zA-Z0-9\s]', '', item).lower().split()[:3]
                if words:
                    cleaned.append('_'.join(words))
        return cleaned[:5]

    parsed = {
        "name":         find(r'agent\s+(\w+)', output, 'Agent'),
        "goal":         find(r'goal:\s*"([^"]+)"', output),
        "allow":        parse_list(r'allow:\s*\[([^\]]+)\]', output),
        "block":        parse_list(r'block:\s*\[([^\]]+)\]', output),
        "confirm":      parse_list(r'confirm:\s*\[([^\]]+)\]', output),
        "trust":        find(r'trust:\s*(\w+)', output, 'low'),
        "on_uncertain": find(r'on_uncertain:\s*(\w+)', output, 'escalate'),
        "on_error":     find(r'on_error:\s*(\w+)', output, 'escalate'),
    }

    return jsonify({"result": parsed, "ok": True})

if __name__ == '__main__':
    app.run(port=8080, debug=True)
