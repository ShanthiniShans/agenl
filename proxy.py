from flask import Flask, request, jsonify
import anthropic
import os
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__, static_folder='templates', static_url_path='')

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
        max_tokens=1000,
        system="""You are an AGENL contract generator. Convert the user description into a JSON object with these exact keys: name, goal, allow, block, confirm, trust, on_uncertain, on_error. Return ONLY JSON.""",
        messages=[{"role": "user", "content": description}]
    )

    return jsonify({"result": message.content[0].text})

if __name__ == '__main__':
    app.run(port=8080, debug=True)
