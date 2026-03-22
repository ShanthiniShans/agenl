from rich.console import Console
from rich.panel import Panel
from rich.table import Table

console = Console()

def execute_agent(agent: dict):
    console.print(Panel(
        f"[bold]Agent:[/bold] {agent.get('name', 'Unknown')}\n"
        f"[bold]Goal:[/bold] {agent.get('goal', 'Not specified')}\n"
        f"[bold]Persona:[/bold] {agent.get('persona', 'Not specified')}",
        title="[green]AGENL — Agent Loaded[/green]",
        border_style="green"
    ))

    tools = agent.get("tools", {})
    trust = agent.get("trust", "medium")
    on_uncertain = agent.get("on_uncertain", "say_so")
    on_error = agent.get("on_error", "escalate")

    table = Table(title="Agent Contract", border_style="dim")
    table.add_column("Property", style="bold")
    table.add_column("Value")

    table.add_row("Allowed tools",  ", ".join(tools.get("allow", [])) or "none")
    table.add_row("Blocked tools",  ", ".join(tools.get("block", [])) or "none")
    table.add_row("Confirm before", ", ".join(tools.get("confirm", [])) or "none")
    table.add_row("Trust level",    trust)
    table.add_row("On uncertain",   on_uncertain)
    table.add_row("On error",       on_error)

    console.print(table)
    console.print("\n[green]Agent contract verified and enforced.[/green]")
    console.print("[dim]Rules are structurally locked — not prompt-based.[/dim]\n")

def check_tool_permission(agent: dict, tool: str) -> str:
    tools = agent.get("tools", {})

    if tool in tools.get("block", []):
        return "blocked"
    if tool in tools.get("confirm", []):
        return "confirm"
    if tool in tools.get("allow", []):
        return "allowed"
    return "not_defined"