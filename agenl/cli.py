import click
import os
import re
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from dotenv import load_dotenv

load_dotenv()

console = Console()

from agenl.converter import convert_to_agenl
from agenl.parser import parse_agent, resolve_inheritance
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

        if agent.get("parent"):
            parent_name = agent["parent"]
            snake = re.sub(r'(?<!^)(?=[A-Z])', '_', parent_name).lower()

            parent_file = f"agents/{parent_name}.agent"
            if not os.path.exists(parent_file):
                parent_file = f"agents/{parent_name.lower()}.agent"
            if not os.path.exists(parent_file):
                parent_file = f"agents/{snake}.agent"

            if os.path.exists(parent_file):
                with open(parent_file, "r") as pf:
                    parent_text = pf.read()
                parent_agent = parse_agent(parent_text)
                agent = resolve_inheritance(agent, parent_agent)
                console.print(f"[dim]Inherited from: {parent_file}[/dim]\n")
            else:
                console.print(f"[yellow]Warning: parent '{parent_name}' not found.[/yellow]\n")

        execute_agent(agent)

    except Exception as e:
        console.print(f"[red]Parse error: {e}[/red]")
        console.print("[dim]Check your .agent file syntax and try again.[/dim]")


@main.command()
@click.argument("description")
@click.option("--save", "-s", default=None,
              help="Save generated agent to a file.")
def convert(description, save):
    """Convert plain English into an AGENL definition.

    Example: agenl convert "an agent that searches the web"
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


@main.command("list")
def list_agents():
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


@main.command()
@click.argument("pipeline_file")
def pipeline(pipeline_file):
    """Display and validate a multi-agent pipeline definition.

    Example: agenl pipeline agents/research_team.pipeline
    """
    console.print(Panel(
        f"[bold]Loading pipeline:[/bold] {pipeline_file}",
        title="[purple]AGENL — Pipeline[/purple]",
        border_style="purple"
    ))

    if not os.path.exists(pipeline_file):
        console.print(f"[red]Error: File not found — {pipeline_file}[/red]")
        return

    with open(pipeline_file, "r") as f:
        content = f.read()

    console.print(Panel(
        content,
        title="[green]Pipeline Definition[/green]",
        border_style="green"
    ))

    flow_steps = []
    for line in content.split("\n"):
        line = line.strip()
        if "->" in line and "step_" in line:
            parts = line.split("->")
            agent_name = parts[0].split(":")[1].strip()
            task = parts[1].strip().strip('"')
            flow_steps.append((agent_name, task))

    if flow_steps:
        table = Table(title="Pipeline Flow", border_style="purple")
        table.add_column("Step", style="bold")
        table.add_column("Agent")
        table.add_column("Task")

        for i, (agent, task) in enumerate(flow_steps, 1):
            table.add_row(f"Step {i}", agent, task)

        console.print(table)

    console.print("\n[green]Pipeline definition loaded.[/green]")
    console.print("[dim]Agents execute in sequence — each passing output to the next.[/dim]")