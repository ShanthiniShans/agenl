import os
import json
import shutil
from pathlib import Path
from rich.console import Console
from rich.table import Table
from rich.panel import Panel

console = Console()

REGISTRY_DIR = Path.home() / ".agenl" / "registry"
REGISTRY_INDEX = REGISTRY_DIR / "index.json"


def ensure_registry():
    REGISTRY_DIR.mkdir(parents=True, exist_ok=True)
    if not REGISTRY_INDEX.exists():
        with open(REGISTRY_INDEX, "w") as f:
            json.dump({"agents": []}, f, indent=2)


def load_index() -> dict:
    ensure_registry()
    with open(REGISTRY_INDEX, "r") as f:
        return json.load(f)


def save_index(index: dict):
    with open(REGISTRY_INDEX, "w") as f:
        json.dump(index, f, indent=2)


def publish_agent(agent_file: str, author: str = "anonymous"):
    if not os.path.exists(agent_file):
        console.print(f"[red]Error: File not found — {agent_file}[/red]")
        return

    with open(agent_file, "r") as f:
        content = f.read()

    from agenl.parser import parse_agent
    try:
        agent = parse_agent(content)
    except Exception as e:
        console.print(f"[red]Cannot publish — invalid agent file: {e}[/red]")
        return

    ensure_registry()
    agent_name = agent.get("name", "Unknown")
    dest = REGISTRY_DIR / f"{agent_name}.agent"
    shutil.copy(agent_file, dest)

    index = load_index()
    existing = [a for a in index["agents"] if a["name"] != agent_name]
    existing.append({
        "name":   agent_name,
        "author": author,
        "goal":   agent.get("goal", ""),
        "trust":  agent.get("trust", "medium"),
        "file":   str(dest)
    })
    index["agents"] = existing
    save_index(index)

    console.print(Panel(
        f"[bold]Agent:[/bold] {agent_name}\n"
        f"[bold]Author:[/bold] {author}\n"
        f"[bold]Goal:[/bold] {agent.get('goal', '')}",
        title="[green]Published to registry[/green]",
        border_style="green"
    ))


def search_registry(query: str = ""):
    index = load_index()
    agents = index.get("agents", [])

    if query:
        agents = [
            a for a in agents
            if query.lower() in a["name"].lower()
            or query.lower() in a.get("goal", "").lower()
        ]

    if not agents:
        console.print("[yellow]No agents found in registry.[/yellow]")
        console.print("[dim]Publish your first agent with: agenl publish agents/research_bot.agent[/dim]")
        return

    table = Table(title="AGENL Registry", border_style="purple")
    table.add_column("Agent",  style="bold")
    table.add_column("Author")
    table.add_column("Goal")
    table.add_column("Trust")
    table.add_column("Pull command")

    for a in agents:
        table.add_row(
            a["name"],
            a.get("author", "anonymous"),
            a.get("goal", "")[:50] + "..." if len(a.get("goal", "")) > 50 else a.get("goal", ""),
            a.get("trust", "medium"),
            f"[dim]agenl pull {a['name']}[/dim]"
        )

    console.print(table)


def pull_agent(agent_name: str, dest_dir: str = "agents"):
    index = load_index()
    agents = index.get("agents", [])
    match = next((a for a in agents if a["name"].lower() == agent_name.lower()), None)

    if not match:
        console.print(f"[red]Agent '{agent_name}' not found in registry.[/red]")
        console.print("[dim]Run agenl search to see available agents.[/dim]")
        return

    src = Path(match["file"])
    if not src.exists():
        console.print(f"[red]Registry file missing for '{agent_name}'.[/red]")
        return

    os.makedirs(dest_dir, exist_ok=True)
    dest = Path(dest_dir) / f"{agent_name}.agent"
    shutil.copy(src, dest)

    console.print(Panel(
        f"[bold]Agent:[/bold] {agent_name}\n"
        f"[bold]Saved to:[/bold] {dest}\n"
        f"[bold]Run with:[/bold] agenl run {dest}",
        title="[green]Pulled from registry[/green]",
        border_style="green"
    ))