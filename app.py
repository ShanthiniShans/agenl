from __future__ import annotations

import json
import os
import re
import socket
import subprocess
import threading
import time
import webbrowser
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from flask import Flask, jsonify, render_template, request

from agenl.converter import convert_to_agenl
from agenl.parser import parse_agent, resolve_inheritance
from agenl.runtime import execute_agent, handle_escalation

BASE_DIR = Path(__file__).resolve().parent
AGENTS_DIR = BASE_DIR / "agents"
ESCALATION_LOG_PATH = BASE_DIR / "escalation_log.json"

app = Flask(__name__, template_folder=str(BASE_DIR / "templates"))

_state_lock = threading.Lock()
RUN_STATE: dict[str, Any] = {
    "status": "idle",
    "agent_file": None,
    "agent_name": None,
    "message": "No run started yet.",
    "last_updated": None,
}


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _set_state(status: str, *, message: str, agent_file: str | None = None, agent_name: str | None = None) -> None:
    with _state_lock:
        RUN_STATE.update(
            {
                "status": status,
                "agent_file": agent_file if agent_file is not None else RUN_STATE.get("agent_file"),
                "agent_name": agent_name if agent_name is not None else RUN_STATE.get("agent_name"),
                "message": message,
                "last_updated": _utc_now(),
            }
        )


def _safe_agent_path(agent_file: str) -> Path:
    candidate = (AGENTS_DIR / agent_file).resolve()
    if not str(candidate).startswith(str(AGENTS_DIR.resolve())):
        raise ValueError("Invalid agent path.")
    if candidate.suffix != ".agent":
        raise ValueError("Agent file must end with .agent.")
    if not candidate.exists():
        raise FileNotFoundError(f"Agent file not found: {agent_file}")
    return candidate


def _load_agent_with_parent(path: Path) -> tuple[dict[str, Any], str]:
    text = path.read_text(encoding="utf-8")
    agent = parse_agent(text)

    if agent.get("parent"):
        parent_name = agent["parent"]
        snake = re.sub(r"(?<!^)(?=[A-Z])", "_", parent_name).lower()
        candidates = [
            AGENTS_DIR / f"{parent_name}.agent",
            AGENTS_DIR / f"{parent_name.lower()}.agent",
            AGENTS_DIR / f"{snake}.agent",
        ]
        for parent_file in candidates:
            if parent_file.exists():
                parent_agent = parse_agent(parent_file.read_text(encoding="utf-8"))
                agent = resolve_inheritance(agent, parent_agent)
                break

    return agent, text


def _load_escalation_log() -> list[dict[str, Any]]:
    if not ESCALATION_LOG_PATH.exists():
        return []
    try:
        raw = json.loads(ESCALATION_LOG_PATH.read_text(encoding="utf-8"))
        if isinstance(raw, dict):
            events = raw.get("escalations", [])
        elif isinstance(raw, list):
            events = raw
        else:
            events = []
    except json.JSONDecodeError:
        events = []

    events = [e for e in events if isinstance(e, dict)]
    events.sort(key=lambda x: x.get("timestamp_utc", ""), reverse=True)
    return events


def _candidate_lean_paths(agent_filename: str) -> list[Path]:
    stem = Path(agent_filename).stem
    snake = re.sub(r"(?<!^)(?=[A-Z])", "_", stem).lower()
    lower = stem.lower()
    variants = []
    for candidate in [stem, snake, lower]:
        if candidate not in variants:
            variants.append(candidate)

    paths: list[Path] = []
    for base in variants:
        paths.extend(
            [
                BASE_DIR / "proofs" / f"{base}.lean",
                BASE_DIR / "lean" / f"{base}.lean",
                AGENTS_DIR / f"{base}.lean",
            ]
        )
    return paths


def _lean_file_info(agent_filename: str) -> tuple[Path, bool, str]:
    for path in _candidate_lean_paths(agent_filename):
        if path.exists():
            return path, True, path.read_text(encoding="utf-8")
    fallback = _candidate_lean_paths(agent_filename)[0]
    placeholder = (
        f"-- Lean verification contract for {Path(agent_filename).stem}\n"
        "-- No proof file exists yet.\n"
        "-- Create this file and prove your contract properties.\n"
    )
    return fallback, False, placeholder


def _run_agent_job(agent_filename: str) -> None:
    try:
        _set_state("running", message="Loading and parsing agent contract...", agent_file=agent_filename)
        path = _safe_agent_path(agent_filename)
        agent, _ = _load_agent_with_parent(path)
        _set_state("running", message="Contract parsed. Executing runtime checks...", agent_name=agent.get("name"))

        time.sleep(0.6)
        execute_agent(agent, interactive=False, escalation_log_path=ESCALATION_LOG_PATH)

        if agent.get("on_uncertain", "say_so") == "escalate":
            _set_state("uncertain", message="Uncertainty triggered; escalation requested.")
            time.sleep(0.6)
            _set_state("escalating", message="Escalation logged for human review.")
            handle_escalation(
                agent,
                "uncertainty",
                activity="Web UI run: preflight decision before tool call.",
                problem="Simulated low-confidence branch during dashboard run.",
                extra_context={"source": "web_ui_runner"},
                escalation_log_path=ESCALATION_LOG_PATH,
                interactive=False,
            )

        _set_state("done", message="Agent run completed.")
    except Exception as exc:  # noqa: BLE001
        _set_state("done", message=f"Run failed: {exc}")


@app.route("/")
def index() -> str:
    return render_template("index.html")


@app.get("/api/agents")
def api_agents():
    files = sorted([p.name for p in AGENTS_DIR.glob("*.agent")])
    return jsonify({"agents": files})


@app.post("/api/convert")
def api_convert():
    body = request.get_json(silent=True) or {}
    description = str(body.get("description", "")).strip()
    if not description:
        return jsonify({"error": "Description is required."}), 400

    try:
        contract_text = convert_to_agenl(description)
        parsed = parse_agent(contract_text)
    except Exception as exc:  # noqa: BLE001
        return jsonify({"error": str(exc)}), 500

    tools = parsed.get("tools", {})
    table = {
        "allowed_tools": tools.get("allow", []),
        "blocked_tools": tools.get("block", []),
        "confirm_tools": tools.get("confirm", []),
        "trust_level": parsed.get("trust", "medium"),
    }
    return jsonify({"contract_text": contract_text, "parsed": parsed, "contract_table": table})


@app.post("/api/run-agent")
def api_run_agent():
    body = request.get_json(silent=True) or {}
    agent_file = str(body.get("agent_file", "")).strip()
    if not agent_file:
        return jsonify({"error": "agent_file is required."}), 400

    try:
        _safe_agent_path(agent_file)
    except Exception as exc:  # noqa: BLE001
        return jsonify({"error": str(exc)}), 400

    thread = threading.Thread(target=_run_agent_job, args=(agent_file,), daemon=True)
    thread.start()
    return jsonify({"ok": True, "status": "running", "agent_file": agent_file})


@app.get("/api/run-status")
def api_run_status():
    with _state_lock:
        snapshot = dict(RUN_STATE)
    return jsonify(snapshot)


@app.get("/api/escalations")
def api_escalations():
    return jsonify({"events": _load_escalation_log()})


@app.get("/api/lean-file")
def api_lean_file():
    agent_file = request.args.get("agent_file", "").strip()
    if not agent_file:
        return jsonify({"error": "agent_file query param is required."}), 400

    path, exists, content = _lean_file_info(agent_file)
    return jsonify(
        {
            "path": str(path.relative_to(BASE_DIR)),
            "exists": exists,
            "content": content,
            "verification_status": "unverified",
        }
    )


@app.post("/api/verify-contract")
def api_verify_contract():
    body = request.get_json(silent=True) or {}
    agent_file = str(body.get("agent_file", "")).strip()
    if not agent_file:
        return jsonify({"error": "agent_file is required."}), 400

    lean_path, exists, _ = _lean_file_info(agent_file)
    if not exists:
        return jsonify(
            {
                "verification_status": "unverified",
                "message": f"No Lean proof file found at {lean_path.relative_to(BASE_DIR)}",
                "path": str(lean_path.relative_to(BASE_DIR)),
            }
        )

    try:
        proc = subprocess.run(
            ["lean", str(lean_path)],
            cwd=BASE_DIR,
            capture_output=True,
            text=True,
            check=False,
            env={**os.environ, "PYTHONPATH": str(BASE_DIR)},
        )
        ok = proc.returncode == 0
        return jsonify(
            {
                "verification_status": "verified" if ok else "unverified",
                "message": proc.stdout.strip() if ok else (proc.stderr.strip() or proc.stdout.strip()),
                "path": str(lean_path.relative_to(BASE_DIR)),
            }
        )
    except FileNotFoundError:
        return jsonify(
            {
                "verification_status": "unverified",
                "message": "Lean executable not found on this machine.",
                "path": str(lean_path.relative_to(BASE_DIR)),
            }
        )


if __name__ == "__main__":
    host = "127.0.0.1"
    preferred_port = 5000
    fallback_port = 5001

    def _port_available(port: int) -> bool:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            return sock.connect_ex((host, port)) != 0

    port = preferred_port if _port_available(preferred_port) else fallback_port
    if port != preferred_port:
        print(
            f"[AGENL] Port {preferred_port} is busy (often AirPlay Receiver on macOS). "
            f"Starting dashboard on http://localhost:{port}"
        )

    threading.Timer(1.0, lambda: webbrowser.open(f"http://localhost:{port}")).start()
    app.run(host=host, port=port, debug=True)
