import json
import tempfile
from pathlib import Path

import pytest

from agenl.exceptions import AGENLBlockedError, AGENLConfirmationRequired
from agenl.plugins import AGENLWrapper


# ---------------------------------------------------------------------------
# Minimal contract fixture
# ---------------------------------------------------------------------------

CONTRACT = """\
agent TestAgent {
  goal: "Test AGENL governance"
  tools {
    allow:   [safe_tool]
    block:   [dangerous_tool]
    confirm: [risky_tool]
  }
  on_uncertain: say_so
  on_error:     escalate
}
"""


@pytest.fixture()
def contract_file(tmp_path):
    p = tmp_path / "test.agent"
    p.write_text(CONTRACT, encoding="utf-8")
    return p


@pytest.fixture()
def log_file(tmp_path):
    return str(tmp_path / "test_log.json")


class _SimpleAgent:
    def __init__(self):
        self.tools = []

    def run(self, input):  # noqa: A002
        return f"ran: {input}"


@pytest.fixture()
def governed(contract_file, log_file):
    return AGENLWrapper(
        agent=_SimpleAgent(),
        contract_path=str(contract_file),
        log_path=log_file,
    )


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


def test_blocked_tool_raises_error(governed):
    with pytest.raises(AGENLBlockedError) as exc_info:
        governed._governed_call("dangerous_tool", lambda: None)
    assert exc_info.value.tool_name == "dangerous_tool"


def test_allowed_tool_proceeds(governed):
    called = []
    governed._governed_call("safe_tool", lambda: called.append(True))
    assert called == [True]


def test_confirm_tool_requires_approval(governed):
    with pytest.raises(AGENLConfirmationRequired) as exc_info:
        governed._governed_call("risky_tool", lambda: None)
    assert exc_info.value.tool_name == "risky_tool"


def test_log_written_to_file(governed, log_file):
    # Trigger an allow and a block so both action types are written
    governed._governed_call("safe_tool", lambda: None)

    with pytest.raises(AGENLBlockedError):
        governed._governed_call("dangerous_tool", lambda: None)

    data = json.loads(Path(log_file).read_text())
    actions = data.get("actions", [])
    assert any(a["tool"] == "safe_tool" and a["status"] == "allowed" for a in actions)
    assert any(a["tool"] == "dangerous_tool" and a["status"] == "blocked" for a in actions)
