+++
title = "Agentic Workspace"
weight = 2
description = "My agentic development setup: Omarchy, Herdr App, hosted and local models, and a compact keyboard cheat sheet."
+++

*Last updated: November 2026*

My workspace brings coding agents into one keyboard-driven workflow. [Agentic Stack](@/generative-ai/1-intro/1_genai_environment.md) covers the tools; this page covers my setup.

## My Setup

| Layer | What I use |
|-------|------------|
| Desktop | **Omarchy / Hyprland** on Linux |
| Agent workspace | **Herdr App** (`herdr-app`) for persistent sessions with **Codex CLI, agy, Pi**, and other agents |
| Native apps | **Codex App** and **Antigravity** |
| Hosted models | **DeepSeek V4** through **OpenRouter** |
| Local inference | **Ollama** and **llama.cpp** to reduce API costs; currently **Ornith**, usually liberated, quantized variants |

Herdr organizes sessions, the harness runs the agent loop, and the model backend provides inference. I keep tasks recognizable, check agents that need input, and review diffs and validation before accepting completed work.

## Keyboard Basics

These are the Herdr App shortcuts I use to create work, move between sessions, and review changes.

| Action | Shortcut |
|--------|----------|
| New workspace | `Ctrl + Shift + N` |
| New tab | `Ctrl + Shift + T` |
| Previous / next tab | `Alt + [` / `Alt + ]` |
| Previous / next agent | `Alt + ↑` / `Alt + ↓` |
| Previous / next workspace | `Alt + Shift + [` / `Alt + Shift + ]` |
| Focus pane: left / down / up / right | `Alt + h / j / k / l` |
| Split pane down / right | `Ctrl + Shift + E` / `Ctrl + Shift + O` |
| Toggle changes review | `Ctrl + Shift + R` |
| Expand / restore pane | `Ctrl + Shift + Enter` |
| Swap pane left / down / up / right | `Alt + Shift + h / j / k / l` |
| Close pane | `Ctrl + Shift + X` |
| Exit shell (empty input line) | `Ctrl + D` — pane may close when the shell exits |
| Close tab | `Ctrl + Shift + W` |
| Command palette | `Ctrl + Shift + P` |
| Workspace / tab picker | `Ctrl + Shift + K` |
| Rename tab / agent | `F2` |
| Rename workspace | `Shift + F2` |

**How to remember:**

- **E** looks like three horizontal bars: split down, stacking panes.
- **O** sits on the right side of the keyboard: split right.
- **D** = “destroy” as a memory aid: `Ctrl + D` sends end-of-input, usually exiting a shell at an empty prompt.
- **Alt** navigates tabs, agents, and panes. Add **Shift** to `[` / `]` to move up a level to workspaces.
