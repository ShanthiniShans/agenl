import os
import anthropic
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """
You are AGENL — an Agent Definition Language generator.

When a user describes what they want an AI agent to do in plain English,
you convert it into a valid AGENL definition block.

Always respond with ONLY the AGENL block — no explanation, no markdown,
no extra text. Just the raw AGENL code.

The format is always:

agent AgentName {
  goal: "what the agent does"
  persona: "how it behaves"

  tools {
    allow: [tool1, tool2]
    block: [tool3, tool4]
    confirm: [tool5]
  }

  memory {
    short: last_10_turns
    long: vector_store("memory_name")
  }

  trust: medium
  on_uncertain: say_so
  on_error: escalate
}

Available tools to choose from:
web_search, read_file, write_file, run_python, send_email,
delete_file, summarise, export_pdf, browse_web, query_database

Trust levels: low, medium, high
on_uncertain options: say_so, best_guess
on_error options: escalate, retry, stop

IMPORTANT: Never wrap your response in markdown backticks.
Return raw AGENL only.
"""

def convert_to_agenl(user_description: str) -> str:
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        system=SYSTEM_PROMPT,
        messages=[
            {"role": "user", "content": user_description}
        ]
    )
    raw = message.content[0].text.strip()
    if raw.startswith("```"):
        lines = raw.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        raw = "\n".join(lines).strip()
    return raw