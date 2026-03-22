from rich.console import Console
from rich.panel import Panel
from agenl.converter import convert_to_agenl
from agenl.parser import parse_agent
from agenl.runtime import execute_agent, check_tool_permission

console = Console()

def main():
    console.print(Panel(
        "[bold]AGENL — Agent Definition Language[/bold]\n"
        "Convert plain English into verified agent contracts.",
        border_style="purple"
    ))

    console.print("\n[bold]Mode 1 — Load existing agent file[/bold]")
    console.print("Loading: agents/research_bot.agent\n")

    with open("agents/research_bot.agent", "r") as f:
        agent_text = f.read()

    agent = parse_agent(agent_text)
    execute_agent(agent)

    console.print("\n[bold]Mode 2 — Convert natural language to AGENL[/bold]")
    console.print("[dim]Type what you want your agent to do. Press Enter.[/dim]\n")

    user_input = input("Describe your agent: ")

    console.print("\n[yellow]Converting to AGENL...[/yellow]")
    agenl_output = convert_to_agenl(user_input)

    console.print(Panel(
        agenl_output,
        title="[green]Generated AGENL[/green]",
        border_style="green"
    ))

    console.print("\n[yellow]Parsing and verifying contract...[/yellow]")
    generated_agent = parse_agent(agenl_output)
    execute_agent(generated_agent)

    console.print("\n[bold]Tool permission check demo:[/bold]")
    for tool in ["web_search", "send_email", "run_python"]:
        result = check_tool_permission(generated_agent, tool)
        colour = {"allowed": "green", "blocked": "red", "confirm": "yellow"}.get(result, "dim")
        console.print(f"  [{colour}]{tool}: {result}[/{colour}]")

if __name__ == "__main__":
    main()