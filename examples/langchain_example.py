"""
LangChain-style agent governed by AGENL.

Demonstrates AGENLWrapper blocking destructive tools while allowing
safe ones, using the incident_handler.agent contract.
"""

from agenl.exceptions import AGENLBlockedError, AGENLConfirmationRequired
from agenl.plugins import AGENLWrapper


class MockLangChainAgent:
    """Simulates a LangChain agent for demonstration."""

    def __init__(self, tools):
        self.tools = tools

    def run(self, input):  # noqa: A002
        tool_names = [getattr(t, "name", t) for t in self.tools]
        return f"Agent processed: {input} (tools available: {tool_names})"


agent = MockLangChainAgent(
    tools=["query_database", "read_file", "delete_file", "modify_config"]
)

governed = AGENLWrapper(
    agent=agent,
    contract_path="agents/incident_handler.agent",
)

# ALLOWED — query_database is in the allow list
result = governed.run("Check system status")
print(f"Result: {result}")

# BLOCKED — delete_file is in the block list
print("\nAttempting blocked tool: delete_file")
try:
    governed._check_tool("delete_file")
    governed._governed_call("delete_file", lambda: None)
except AGENLBlockedError as e:
    print(f"Blocked (expected): {e}")

# CONFIRM — send_email requires human approval
print("\nAttempting confirm-required tool: send_email")
try:
    governed._governed_call("send_email", lambda: None)
except AGENLConfirmationRequired as e:
    print(f"Confirmation required (expected): {e}")

print("\nDone. Check escalation_log.json for the action audit trail.")
