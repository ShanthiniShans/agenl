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
    data = request.json
    description = data.get('description', '')

    client = anthropic.Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=500,
        system="""Extract agent contract fields.
Return ONLY a JSON object. Use SHORT snake_case tool names (2-3 words max).

Example of correct output:
{
  "name": "IncidentHandler",
  "goal": "Monitor systems and create tickets",
  "allow": ["query_database", "read_logs", "create_ticket", "summarise"],
  "block": ["restart_service", "deploy_code", "delete_logs", "modify_config"],
  "confirm": ["page_oncall", "rollback_deploy"],
  "trust": "low",
  "on_uncertain": "escalate",
  "on_error": "escalate"
}

Rules for tool names:
- MUST be snake_case like: read_file, delete_record, approve_action
- NEVER write sentences as tool names
- Max 3 words per tool name
- 3-5 tools in allow list
- 3-5 tools in block list
- 1-3 tools in confirm list""",
        messages=[{
            "role": "user",
            "content": f"Convert this to a contract: {description}"
        }]
    )

    import json as json_lib
    text = message.content[0].text
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    text = text.strip()

    try:
        parsed = clean_contract(json_lib.loads(text))
        return jsonify({"result": parsed, "ok": True})
    except Exception as e:
        return jsonify({"result": text, "ok": False, "error": str(e)})

if __name__ == '__main__':
    app.run(port=8080, debug=True)
