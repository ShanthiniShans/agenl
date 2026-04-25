"""
AutoGen-style agent governed by AGENL.

AutoGen agents typically expose an .invoke() method rather than .run().
AGENLWrapper handles both patterns transparently.
"""

from agenl.exceptions import AGENLBlockedError, AGENLConfirmationRequired
from agenl.plugins import AGENLWrapper


class MockAutoGenAgent:
    """Simulates an AutoGen ConversableAgent for demonstration."""

    def __init__(self, name, tools):
        self.name = name
        self.tools = tools

    def invoke(self, message):
        tool_names = [getattr(t, "name", t) for t in self.tools]
        return {
            "role": self.name,
            "content": f"AutoGen processed: {message} (tools: {tool_names})",
        }


agent = MockAutoGenAgent(
    name="IncidentResponder",
    tools=["query_database", "read_file", "restart_service", "deploy_code"],
)

governed = AGENLWrapper(
    agent=agent,
    contract_path="agents/incident_handler.agent",
)

# ALLOWED — read_file is in the allow list
result = governed.run("Analyse recent error logs")
print(f"Result: {result}")

# BLOCKED — restart_service is in the block list
print("\nAttempting blocked tool: restart_service")
try:
    governed._governed_call("restart_service", lambda: None)
except AGENLBlockedError as e:
    print(f"Blocked (expected): {e}")

# CONFIRM — page_oncall requires human approval
print("\nAttempting confirm-required tool: page_oncall")
try:
    governed._governed_call("page_oncall", lambda: None)
except AGENLConfirmationRequired as e:
    print(f"Confirmation required (expected): {e}")

print("\nDone. Check escalation_log.json for the action audit trail.")
