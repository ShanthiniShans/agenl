import click
import os
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from dotenv import load_dotenv

load_dotenv()

console = Console()

from agenl.converter import convert_to_agenl
from agenl.parser import parse_agent
from agenl.runtime import execute_agent, check_tool_permission

@click.group()
def main():
    """AGENL — Agent Definition Language.
    
    Convert natural language into verified AI agent contracts.
    """
    pass

@main.command()
@click.argument("agent_file")
def run(agent_file):
    """Load and execute an agent from a .agent file.
    
    Example: agenl run agents/research_bot.agent
    """
    console.print(Panel(
        f"[bold]Loading:[/bold] {agent_file}",
        title="[purple]AGENL — Run[/purple]",
        border_style="purple"
    ))

    if not os.path.exists(agent_file):
        console.print(f"[red]Error: File not found — {agent_file}[/red]")
        return

    with open(agent_file, "r") as f:
        agent_text = f.read()

    try:
        agent = parse_agent(agent_text)
        execute_agent(agent)
    except Exception as e:
        console.print(f"[red]Parse error: {e}[/red]")
        console.print("[dim]Check your .agent file syntax and try again.[/dim]")

@main.command()
@click.argument("description")
@click.option("--save", "-s", default=None,
              help="Save generated agent to a file. Example: --save agents/my_bot.agent")
def convert(description, save):
    """Convert a plain English description into an AGENL definition.

    Example: agenl convert "an agent that searches the web but never sends emails"
    """
    console.print(Panel(
        f"[bold]Input:[/bold] {description}",
        title="[purple]AGENL — Convert[/purple]",
        border_style="purple"
    ))

    console.print("\n[yellow]Converting to AGENL...[/yellow]\n")

    try:
        agenl_output = convert_to_agenl(description)

        console.print(Panel(
            agenl_output,
            title="[green]Generated AGENL[/green]",
            border_style="green"
        ))

        agent = parse_agent(agenl_output)
        execute_agent(agent)

        if save:
            with open(save, "w") as f:
                f.write(agenl_output)
            console.print(f"\n[green]Saved to: {save}[/green]")

    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")

@main.command()
@click.argument("agent_file")
def validate(agent_file):
    """Validate an existing .agent file for syntax errors.

    Example: agenl validate agents/research_bot.agent
    """
    console.print(Panel(
        f"[bold]Validating:[/bold] {agent_file}",
        title="[purple]AGENL — Validate[/purple]",
        border_style="purple"
    ))

    if not os.path.exists(agent_file):
        console.print(f"[red]Error: File not found — {agent_file}[/red]")
        return

    with open(agent_file, "r") as f:
        agent_text = f.read()

    try:
        agent = parse_agent(agent_text)

        table = Table(title="Validation Result", border_style="green")
        table.add_column("Check", style="bold")
        table.add_column("Result")

        table.add_row("Syntax",        "[green]Valid[/green]")
        table.add_row("Agent name",    agent.get("name", "missing"))
        table.add_row("Goal defined",  "[green]Yes[/green]" if agent.get("goal") else "[red]Missing[/red]")
        table.add_row("Tools defined", "[green]Yes[/green]" if agent.get("tools") else "[yellow]Not defined[/yellow]")
        table.add_row("Trust level",   agent.get("trust", "[yellow]Not set[/yellow]"))

        console.print(table)
        console.print("\n[green]Agent definition is valid.[/green]")

    except Exception as e:
        console.print(f"\n[red]Validation failed: {e}[/red]")
        console.print("[dim]Fix the syntax error above and try again.[/dim]")

@main.command()
def list():
    """List all .agent files in the agents/ folder.

    Example: agenl list
    """
    agents_dir = "agents"

    if not os.path.exists(agents_dir):
        console.print("[red]No agents/ folder found in current directory.[/red]")
        return

    files = [f for f in os.listdir(agents_dir) if f.endswith(".agent")]

    if not files:
        console.print("[yellow]No .agent files found in agents/[/yellow]")
        return

    table = Table(title="Available Agents", border_style="purple")
    table.add_column("File", style="bold")
    table.add_column("Run command")

    for f in files:
        table.add_row(f, f"[dim]agenl run agents/{f}[/dim]")

    console.print(table)