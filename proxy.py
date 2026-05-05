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

@app.route('/')
def index():
    return app.send_static_file('agenl_dashboard.html')

@app.route('/api/convert', methods=['POST'])
def convert():
    try:
        data = request.json
        description = data.get('description', '')
        if not description:
            return jsonify({"error": "description is required"}), 400

        client = anthropic.Anthropic(api_key=API_KEY)

        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1000,
            system="""You are an AGENL contract generator. Convert the user description into a compact agent contract JSON.

Rules:
- name: CamelCase, max 3 words, no Agent suffix
- goal: one sentence, max 15 words
- allow: list of 3-6 SHORT tool names like query_database, read_file, run_python, web_search, summarise, export_pdf, browse_web. Use underscore_case, max 3 words each
- block: list of 3-6 SHORT tool names like delete_file, modify_record, send_email, approve_action, deploy_code, restart_service. Use underscore_case, max 3 words each
- confirm: list of 1-3 SHORT tool names that need human approval
- trust: exactly one of: low, medium, high
- on_uncertain: exactly one of: escalate, say_so
- on_error: exactly one of: escalate, stop

Return ONLY raw JSON. No explanation. No prose. Tool names must be short snake_case strings. Never write full sentences as tool names.""",
            messages=[{"role": "user", "content": description}]
        )

        import json as json_lib
        text = message.content[0].text
        text = re.sub(r'^```json\s*', '', text.strip())
        text = re.sub(r'^```\s*', '', text.strip())
        text = re.sub(r'\s*```$', '', text.strip())
        text = text.strip()

        try:
            parsed = json_lib.loads(text)
            return jsonify({"result": parsed, "ok": True})
        except Exception:
            return jsonify({"result": text, "ok": False})
    except Exception as e:
        return jsonify({"error": {"message": str(e)}}), 500

if __name__ == '__main__':
    app.run(port=8080, debug=True)
