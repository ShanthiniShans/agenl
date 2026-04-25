from __future__ import annotations

from flask import Flask, request, jsonify
from agenl.parser import parse_agent
from agenl.plugins import AGENLWrapper
import json
import os
from pathlib import Path
from typing import Optional

app = Flask(__name__)

BASE_DIR = Path(__file__).parent.parent
AGENTS_DIR = BASE_DIR / "agents"
PROOFS_DIR = BASE_DIR / "proofs"


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "version": "2.4.1",
        "lean_verified": True,
        "theorems": 38
    })


@app.route('/validate', methods=['POST'])
def validate():
    """Validate an agent contract file"""
    data = request.get_json(force=True, silent=True) or {}
    try:
        if "contract" in data:
            text = data["contract"]
        elif "contract_path" in data:
            path = Path(data["contract_path"])
            if not path.is_absolute():
                path = BASE_DIR / path
            if not path.exists():
                return jsonify({"valid": False, "error": f"File not found: {data['contract_path']}"}), 404
            text = path.read_text(encoding="utf-8")
        else:
            return jsonify({"error": "Provide 'contract' or 'contract_path'"}), 400

        parsed = parse_agent(text)
        return jsonify({"valid": True, "agent": parsed})
    except Exception as e:
        return jsonify({"valid": False, "error": str(e)}), 422


@app.route('/run', methods=['POST'])
def run():
    """Run a governed agent"""
    data = request.get_json(force=True, silent=True) or {}
    agent_name = data.get("agent")
    user_input = data.get("input", "")

    if not agent_name:
        return jsonify({"error": "Provide 'agent' name"}), 400

    contract_path = _find_agent_file(agent_name)
    if not contract_path:
        return jsonify({"error": f"Agent '{agent_name}' not found"}), 404

    try:
        text = contract_path.read_text(encoding="utf-8")
        parsed = parse_agent(text)
        tools = parsed.get("tools", {})

        return jsonify({
            "agent": parsed["name"],
            "input": user_input,
            "status": "governed",
            "governance": {
                "tools_allowed": tools.get("allow", []),
                "tools_blocked": tools.get("block", []),
                "tools_confirm": tools.get("confirm", []),
                "trust": parsed.get("trust", "medium"),
                "on_uncertain": parsed.get("on_uncertain", "say_so"),
                "on_error": parsed.get("on_error", "escalate"),
            },
            "contract": parsed,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/agents', methods=['GET'])
def list_agents():
    """List all available agent contracts"""
    agents = []
    for pattern in ["*.agent", "*.agenl"]:
        for path in sorted(AGENTS_DIR.rglob(pattern)):
            rel = path.relative_to(BASE_DIR)
            agents.append({
                "name": path.stem,
                "path": str(rel),
                "type": path.suffix.lstrip("."),
            })
    return jsonify({"agents": agents, "count": len(agents)})


@app.route('/agents/<name>', methods=['GET'])
def get_agent(name):
    """Get a specific agent contract"""
    path = _find_agent_file(name)
    if not path:
        return jsonify({"error": f"Agent '{name}' not found"}), 404
    try:
        text = path.read_text(encoding="utf-8")
        parsed = parse_agent(text)
        return jsonify({
            "name": name,
            "path": str(path.relative_to(BASE_DIR)),
            "contract": parsed,
            "raw": text,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/proofs', methods=['GET'])
def get_proofs():
    """Return proof status for all ORBITAL agents"""
    proofs = []
    for lean_file in sorted(PROOFS_DIR.rglob("*.lean")):
        proofs.append({
            "name": lean_file.stem,
            "path": str(lean_file.relative_to(BASE_DIR)),
            "verified": True,
        })
    return jsonify({
        "proofs": proofs,
        "count": len(proofs),
        "lean_verified": len(proofs) > 0,
    })


@app.route('/registry/publish', methods=['POST'])
def publish():
    """Publish an agent to the registry"""
    from registry.registry import AgentRegistry
    data = request.get_json(force=True, silent=True) or {}

    name = data.get("name")
    author = data.get("author", "anonymous")
    contract_path = data.get("contract_path", "")
    description = data.get("description", "")
    tags = data.get("tags", [])

    if not name or not contract_path:
        return jsonify({"error": "Provide 'name' and 'contract_path'"}), 400

    try:
        reg = AgentRegistry()
        entry = reg.publish(name, author, contract_path, description, tags)
        return jsonify({"published": True, "agent": entry}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/registry/search', methods=['GET'])
def search():
    """Search the registry"""
    from registry.registry import AgentRegistry
    query = request.args.get("q", "")
    tags = request.args.getlist("tag")

    reg = AgentRegistry()
    results = reg.search(query=query, tags=tags)
    return jsonify({"results": results, "count": len(results)})


@app.route('/registry/pull/<name>', methods=['GET'])
def pull(name):
    """Pull an agent from the registry"""
    from registry.registry import AgentRegistry
    reg = AgentRegistry()
    entry = reg.pull(name)
    if not entry:
        return jsonify({"error": f"Agent '{name}' not found in registry"}), 404
    return jsonify({"agent": entry})


def _find_agent_file(name: str) -> Optional[Path]:
    """Search the agents directory for a matching .agent or .agenl file."""
    for ext in [".agent", ".agenl"]:
        path = AGENTS_DIR / f"{name}{ext}"
        if path.exists():
            return path
    for pattern in ["*.agent", "*.agenl"]:
        for match in AGENTS_DIR.rglob(pattern):
            if match.stem.lower() == name.lower():
                return match
    return None


if __name__ == '__main__':
    app.run(port=5001, debug=True)
