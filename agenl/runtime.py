"""AGENL runtime: contract display, tool permissions, and human-in-the-loop escalation."""

from __future__ import annotations

import json
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Literal, Optional

from rich.console import Console
from rich.panel import Panel
from rich.table import Table

console = Console()

TriggerKind = Literal["uncertainty", "error"]
DEFAULT_ESCALATION_LOG = "escalation_log.json"


def _utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _agent_snapshot(agent: dict) -> dict[str, Any]:
    """Trimmed contract for logs (full enough to audit, small enough for JSON)."""
    tools = agent.get("tools") or {}
    return {
        "name": agent.get("name"),
        "goal": agent.get("goal"),
        "persona": agent.get("persona"),
        "trust": agent.get("trust"),
        "on_uncertain": agent.get("on_uncertain", "say_so"),
        "on_error": agent.get("on_error", "escalate"),
        "tools": {
            "allow": list(tools.get("allow", [])),
            "block": list(tools.get("block", [])),
            "confirm": list(tools.get("confirm", [])),
        },
    }


def _policy_for_trigger(agent: dict, kind: TriggerKind) -> str:
    if kind == "uncertainty":
        return agent.get("on_uncertain", "say_so")
    return agent.get("on_error", "escalate")


def _should_escalate(agent: dict, kind: TriggerKind) -> bool:
    return _policy_for_trigger(agent, kind) == "escalate"


def _load_escalation_log(path: Path) -> dict[str, Any]:
    if not path.is_file():
        return {"escalations": []}
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, list):
            return {"escalations": data}
        if isinstance(data, dict) and "escalations" in data:
            return data
    except (json.JSONDecodeError, OSError):
        pass
    return {"escalations": []}


def _atomic_write_json(path: Path, data: Any) -> None:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(path.suffix + ".tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
        f.write("\n")
    tmp.replace(path)


def _append_escalation_record(path: Path, record: dict[str, Any]) -> None:
    """Append one escalation report and persist to escalation_log.json."""
    data = _load_escalation_log(path)
    data.setdefault("escalations", []).append(record)
    _atomic_write_json(path, data)


def _print_escalation_summary(
    agent: dict,
    kind: TriggerKind,
    activity: str,
    problem: str,
    full_context: dict[str, Any],
) -> None:
    """Human-readable summary while execution is paused."""
    trigger_label = "Uncertainty" if kind == "uncertainty" else "Error"
    name = agent.get("name", "Unknown")
    console.print()
    console.print(
        Panel(
            f"[bold yellow]{trigger_label} — human decision required[/bold yellow]\n\n"
            f"[bold]Agent[/bold]: {name}\n"
            f"[bold]What it was doing[/bold]:\n{activity}\n\n"
            f"[bold]What went wrong[/bold]:\n{problem}\n\n"
            "[bold]Your decision[/bold]:\n"
            "  [green][A]pprove[/green] — continue with the current plan\n"
            "  [red][R]eject[/red] — stop this line of work\n"
            "  [cyan][M]odify[/cyan] — add instructions, then resume with that override",
            title="[bold red]ESCALATION[/bold red]",
            border_style="red",
        )
    )
    console.print(
        "[dim]After you decide, one report (full context + your choice) is appended to escalation_log.json.[/dim]\n"
    )


def _prompt_human_decision() -> tuple[str, Optional[str]]:
    """
    Block until the operator chooses approve / reject / modify.
    Returns (decision, instruction) where instruction is set only for modify.
    """
    while True:
        raw = console.input(
            "[bold]Choose[/bold] [A]pprove / [R]eject / [M]odify: "
        ).strip().lower()
        if not raw:
            continue
        first = raw[0]
        if first == "a":
            return "approve", None
        if first == "r":
            return "reject", None
        if first == "m":
            instruction = console.input(
                "[bold]Instructions for the agent[/bold] (how to proceed): "
            ).strip()
            if not instruction:
                console.print("[yellow]No text entered — try again or choose Approve/Reject.[/yellow]")
                continue
            return "modify", instruction
        console.print("[yellow]Please enter A, R, or M.[/yellow]")


def _handle_non_escalate_policy(agent: dict, kind: TriggerKind) -> None:
    """When the contract does not ask for escalation, apply a simple stub behaviour."""
    pol = _policy_for_trigger(agent, kind)
    name = agent.get("name", "Unknown")
    if kind == "uncertainty":
        if pol == "say_so":
            console.print(
                Panel(
                    f"[{name}] Uncertain — contract says [bold]say_so[/bold]: "
                    "stating uncertainty to the user (no human gate).",
                    title="[yellow]On uncertain[/yellow]",
                    border_style="yellow",
                )
            )
        else:
            console.print(
                f"[dim][{name}] on_uncertain={pol!r} — no escalation gate in this runtime stub.[/dim]"
            )
    else:
        if pol == "stop":
            console.print(
                Panel(
                    f"[{name}] Error path — contract says [bold]stop[/bold] (no human gate).",
                    title="[red]On error[/red]",
                    border_style="red",
                )
            )
        elif pol == "retry":
            console.print(
                Panel(
                    f"[{name}] Error path — contract says [bold]retry[/bold] (stub: would retry).",
                    title="[yellow]On error[/yellow]",
                    border_style="yellow",
                )
            )
        else:
            console.print(
                f"[dim][{name}] on_error={pol!r} — no escalation gate in this runtime stub.[/dim]"
            )


def handle_escalation(
    agent: dict,
    kind: TriggerKind,
    *,
    activity: str,
    problem: str,
    extra_context: Optional[dict[str, Any]] = None,
    escalation_log_path: str | Path = DEFAULT_ESCALATION_LOG,
    interactive: Optional[bool] = None,
) -> dict[str, Any]:
    """
    Pause (if interactive), log context to escalation_log.json, prompt for a decision, return outcome.

    Use this from your own driver when the model/runtime hits ambiguity or failure.
    """
    if interactive is None:
        interactive = sys.stdin.isatty()

    if not _should_escalate(agent, kind):
        _handle_non_escalate_policy(agent, kind)
        return {"decision": None, "instruction": None, "escalated": False}

    path = Path(escalation_log_path)
    escalation_id = str(uuid.uuid4())
    started = _utc_now_iso()

    full_context: dict[str, Any] = {
        "escalation_id": escalation_id,
        "started_at_utc": started,
        "trigger": kind,
        "activity": activity,
        "problem": problem,
        "agent": _agent_snapshot(agent),
    }
    if extra_context:
        full_context["extra"] = extra_context

    if not interactive:
        console.print(
            "[yellow]Escalation: non-interactive mode — skipping human prompt (still logging).[/yellow]"
        )
        record = {
            "id": escalation_id,
            "timestamp_utc": started,
            "agent_name": agent.get("name"),
            "trigger": kind,
            "activity": activity,
            "problem": problem,
            "full_context": full_context,
            "human_decision": None,
            "human_instruction": None,
            "resolved_at_utc": _utc_now_iso(),
            "status": "logged_without_prompt",
        }
        _append_escalation_record(path, record)
        return {
            "decision": None,
            "instruction": None,
            "escalated": True,
            "escalation_id": escalation_id,
            "log_path": str(path.resolve()),
        }

    _print_escalation_summary(agent, kind, activity, problem, full_context)
    decision, instruction = _prompt_human_decision()
    resolved = _utc_now_iso()

    record = {
        "id": escalation_id,
        "timestamp_utc": started,
        "agent_name": agent.get("name"),
        "trigger": kind,
        "activity": activity,
        "problem": problem,
        "full_context": full_context,
        "human_decision": decision,
        "human_instruction": instruction,
        "resolved_at_utc": resolved,
        "status": "resolved",
    }
    _append_escalation_record(path, record)

    if decision == "approve":
        console.print(
            Panel(
                "[green]Human approved.[/green] Resuming with the current plan.",
                title="[green]Resume[/green]",
                border_style="green",
            )
        )
    elif decision == "reject":
        console.print(
            Panel(
                "[red]Human rejected.[/red] Halting this line of work.",
                title="[red]Stopped[/red]",
                border_style="red",
            )
        )
    else:
        console.print(
            Panel(
                f"[cyan]Human override recorded.[/cyan] Resuming with:\n{instruction}",
                title="[cyan]Resume with modification[/cyan]",
                border_style="cyan",
            )
        )

    return {
        "decision": decision,
        "instruction": instruction,
        "escalated": True,
        "escalation_id": escalation_id,
        "log_path": str(path.resolve()),
    }


def _run_interactive_session(
    agent: dict,
    escalation_log_path: str | Path,
) -> None:
    """
    After the contract is shown, drive simple scenarios so you can test escalation locally.

    Commands: u = uncertainty, e = error, t <tool> = permission check (may escalate
    if the tool is not in the contract and on_uncertain is escalate), q = quit.
    """
    console.print(
        Panel(
            "[bold]Interactive session[/bold] (execution is paused between commands until you type one).\n"
            "  [cyan]u[/cyan] — simulate uncertainty (uses [bold]on_uncertain[/bold])\n"
            "  [cyan]e[/cyan] — simulate an error (uses [bold]on_error[/bold])\n"
            "  [cyan]t[/cyan] [dim]<tool>[/dim] — check tool permission; not defined → may escalate\n"
            "  [cyan]q[/cyan] — quit",
            title="[purple]Session[/purple]",
            border_style="purple",
        )
    )
    while True:
        raw = console.input("[bold magenta]session>[/bold magenta] ").strip()
        if not raw:
            continue
        parts = raw.split(maxsplit=1)
        cmd = parts[0].lower()
        rest = parts[1] if len(parts) > 1 else ""

        if cmd == "q":
            console.print("[dim]End session.[/dim]")
            break

        if cmd == "u":
            out = handle_escalation(
                agent,
                "uncertainty",
                activity="Simulated step: gathering evidence before answering the user.",
                problem="Model confidence below threshold; ambiguous sources for the claim.",
                escalation_log_path=escalation_log_path,
            )
            if out.get("decision") == "reject":
                break
            continue

        if cmd == "e":
            out = handle_escalation(
                agent,
                "error",
                activity="Simulated step: calling an external tool and merging results.",
                problem="Tool returned HTTP 503; two retries already exhausted.",
                escalation_log_path=escalation_log_path,
            )
            if out.get("decision") == "reject":
                break
            continue

        if cmd == "t":
            tool = rest.strip()
            if not tool:
                console.print("[yellow]Usage: t <tool_name>[/yellow]")
                continue
            status = check_tool_permission(agent, tool)
            console.print(f"[dim]Tool[/dim] [bold]{tool}[/bold] → [bold]{status}[/bold]")
            if status == "not_defined" and _should_escalate(agent, "uncertainty"):
                out = handle_escalation(
                    agent,
                    "uncertainty",
                    activity=f"Deciding whether to invoke tool [bold]{tool}[/bold].",
                    problem="Tool is not listed under allow / block / confirm — policy requires human escalation.",
                    extra_context={"tool": tool, "permission_status": status},
                    escalation_log_path=escalation_log_path,
                )
                if out.get("decision") == "reject":
                    break
            elif status == "not_defined":
                _handle_non_escalate_policy(agent, "uncertainty")
            continue

        console.print("[yellow]Unknown command. Try u, e, t <tool>, or q.[/yellow]")


def execute_agent(
    agent: dict,
    *,
    interactive: Optional[bool] = None,
    escalation_log_path: str | Path = DEFAULT_ESCALATION_LOG,
) -> None:
    """
    Display the verified contract, then optionally run an interactive session.

    When ``interactive`` is None, the session runs only if stdin is a TTY (so pipes
    and scripts do not block on input).
    """
    console.print(
        Panel(
            f"[bold]Agent:[/bold] {agent.get('name', 'Unknown')}\n"
            f"[bold]Goal:[/bold] {agent.get('goal', 'Not specified')}\n"
            f"[bold]Persona:[/bold] {agent.get('persona', 'Not specified')}",
            title="[green]AGENL — Agent Loaded[/green]",
            border_style="green",
        )
    )

    tools = agent.get("tools", {})
    trust = agent.get("trust", "medium")
    on_uncertain = agent.get("on_uncertain", "say_so")
    on_error = agent.get("on_error", "escalate")

    table = Table(title="Agent Contract", border_style="dim")
    table.add_column("Property", style="bold")
    table.add_column("Value")

    table.add_row("Allowed tools", ", ".join(tools.get("allow", [])) or "none")
    table.add_row("Blocked tools", ", ".join(tools.get("block", [])) or "none")
    table.add_row("Confirm before", ", ".join(tools.get("confirm", [])) or "none")
    table.add_row("Trust level", trust)
    table.add_row("On uncertain", on_uncertain)
    table.add_row("On error", on_error)

    console.print(table)
    console.print("\n[green]Agent contract verified and enforced.[/green]")
    console.print("[dim]Rules are structurally locked — not prompt-based.[/dim]\n")

    if interactive is None:
        interactive = sys.stdin.isatty()

    if interactive:
        _run_interactive_session(agent, escalation_log_path)
    else:
        console.print(
            "[dim]Non-interactive stdin: skipping session loop. "
            "Call [bold]handle_escalation()[/bold] from your integration when needed.[/dim]"
        )


def check_tool_permission(agent: dict, tool: str) -> str:
    tools = agent.get("tools", {})

    if tool in tools.get("block", []):
        return "blocked"
    if tool in tools.get("confirm", []):
        return "confirm"
    if tool in tools.get("allow", []):
        return "allowed"
    return "not_defined"
