+++
title = "Agentic Workspace"
weight = 2
description = "An opinionated workspace for agentic development: Herdr, session organization, keyboard workflows, and consistency across operating systems."
+++

*Draft — November 2026. The workspace principles below are a proposal; the concrete keybindings and platform checks are still to come.*

An agentic development workspace needs to make several activities feel natural: starting work, moving between agents, spotting a blocked task, reviewing changes, and returning to an earlier session.

My goal is a consistent way of working across Linux, macOS, and Windows. Herdr is the starting point for this setup, with keyboard bindings as one part of the design. Session organization, attention, and review deserve the same care.

For an overview of orchestrators, harnesses, skills, and MCP connectors, see [Agentic Stack](@/generative-ai/1-intro/1_genai_environment.md).

## My Current Setup

I use **Herdr** as a shared workspace for **Codex CLI**, **agy**, **Pi**, and other coding agents. It manages persistent sessions and tracks when an agent is working, blocked, or done.

- **Herdr:** a common place to organize tasks, switch between agents, and follow parallel work.
- **Connected agents:** Codex CLI, agy, Pi, and others, chosen for the task.
- **Hosted models:** I use OpenRouter for DeepSeek V4.
- **Local models:** I use Ollama and llama.cpp to reduce costs. I am currently using Ornith, and usually choose liberated, quantized model variants.
- **Native apps:** I also use Codex App and Antigravity alongside this terminal workflow.

This is the starting configuration. The workspace should remain understandable as I change a model, harness, terminal, or operating system.

## A Local Hosting Option

Local inference is part of my cost strategy. I use **Ollama** and **llama.cpp** alongside hosted access through **OpenRouter**, where I currently use **DeepSeek V4**. My current local choice is **Ornith**, usually in liberated, quantized variants.

The workspace has three responsibilities: Herdr organizes sessions, the connected harness runs the agent loop, and the model backend handles inference. With a compatible harness, that backend can be a hosted service or a local server.

I want to judge the local setup by how it handles actual work: whether the model fits in memory, responds quickly enough, follows tool calls, and produces changes worth reviewing. The next configuration pass will document the model variant, quantization, hardware, and endpoint settings so the setup is reproducible.

## Workspace Principles

### Organize Around Tasks

A session should make its purpose clear. Give it a recognizable task name and keep enough context to return without reconstructing the conversation. When tasks need independent branches, use separate worktrees so their changes can be reviewed independently.

### Make Attention Deliberate

With several agents running, knowing where to look becomes part of the workflow. I want a clear path to work that needs input, a way to check progress, and a separate step for reviewing completed work.

An agent reporting “done” is the signal to review its changes and validation results.

### Keep Navigation Predictable

Moving between projects, sessions, and panes should follow a coherent pattern. Related actions should feel related, and destructive actions should be hard to trigger accidentally.

The same navigation habits should carry across machines. A change of operating system should require as little relearning as possible.

## An Opinionated Keyboard Workflow

The bindings should start from the actions I repeat. This is the proposed action vocabulary; the actual keys will follow after checking the configuration and platform conflicts.

| Area | Actions to cover |
|------|------------------|
| Projects and tasks | Open a project, start a task, return to recent work |
| Agent sessions | Create, find, switch, and resume sessions |
| Panes and layout | Move focus, split the view, resize, and expand the active pane |
| Attention | Find sessions needing input and inspect their context |
| Review | Inspect diffs, check validation, and return to the agent |
| Session lifecycle | Interrupt, close, and clean up deliberately |

These actions may live in different tools. The binding reference should identify which layer handles each action: the operating system, terminal, Herdr, or the agent harness.

## Across Linux, macOS, and Windows

Cross-platform consistency needs an explicit mapping and real checks. Modifier keys, desktop shortcuts, terminal behavior, and shell line editing can all affect which bindings reach the intended tool.

For each binding, I want to document:

- The action and the tool that owns it.
- The keys on Linux, macOS, and Windows.
- Any terminal or desktop configuration required.
- Conflicts and an alternative where necessary.
- The environments where I have tested it.

The goal is consistent actions and muscle memory across platforms. Exact key combinations will depend on what survives those checks.

## The Daily Loop

1. Open the project and choose a task.
2. Start or resume an agent session with the relevant context.
3. Move to other work while the agent runs.
4. Return when input is needed, inspect the context, and respond.
5. Review the resulting diff and validation before accepting the work.
6. Keep useful sessions available and clean up finished work.

This loop is the basis for judging the setup: does it make it easier to keep track of work and give each task the attention it needs?

## Next: The Concrete Configuration

The next revision will add the Herdr configuration, the binding reference, and the results of testing it across operating systems. Until then, this page records the intended workflow rather than a verified portable configuration.
