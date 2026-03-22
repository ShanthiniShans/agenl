# AGENL — VS Code Extension

Syntax highlighting for `.agent` and `.pipeline` files.

## What it highlights

- `agent`, `pipeline`, `extends`, `tools`, `memory` — keywords
- `goal`, `persona`, `trust`, `on_uncertain`, `on_error` — properties  
- `allow`, `block`, `confirm` — tool permission levels
- `web_search`, `run_python`, `send_email` etc — tool names
- Strings, comments, values like `medium`, `high`, `say_so`
- Agent names, pipeline names, inheritance chains

## Install

Search **AGENL** in the VS Code Extensions marketplace.

Or install manually — download the `.vsix` file from the
[AGENL GitHub repo](https://github.com/ShanthiniShans/agenl)
and run:
```bash
code --install-extension agenl-0.1.0.vsix
```

## Part of the AGENL project

This extension is part of AGENL — the Agent Definition Language.
Convert natural language into verified AI agent contracts.

[github.com/ShanthiniShans/agenl](https://github.com/ShanthiniShans/agenl)
