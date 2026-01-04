+++
title = "LLM Agents"
weight = 3
+++

### [AutoGen] Enabling Next-Gen LLM Applications via Multi-Agent Chat

Arxiv: [https://arxiv.org/abs/2308.08155](https://arxiv.org/abs/2308.08155) _3 Oct 2023 **Microsoft**_

AutoGen is an open-source framework that allows developers to build LLM applications via multiple agents that can converse with each other to accomplish tasks. The framework enables:

- Multi-agent conversations where agents can collaborate to solve complex tasks
- Customizable agent behaviors and capabilities
- Flexible agent interaction patterns
- Integration with various LLM backends
- Support for both synchronous and asynchronous communication

Key Features:
1. Conversable Agents: Agents that can engage in natural language conversations
2. Task-Oriented Dialogues: Structured conversations aimed at completing specific tasks
3. Dynamic Agent Teams: Ability to form and modify agent teams based on task requirements
4. Extensible Architecture: Easy integration of new agent types and capabilities

### [RetroFormer] Retrospective LL Agents with Policy Gradient Optimization

Arxiv: [https://arxiv.org/abs/2308.02151](https://arxiv.org/abs/2308.02151) _4 Aug 2023 **Salesforce**_

This paper introduces Retroformer, a principled framework for reinforcing language agents by learning a plug-in retrospective model, which automatically refines the language agent prompts from environment feedback through policy optimization. Specifically, our proposed agent architecture can learn from arbitrary reward information across multiple environments and tasks, for iteratively fine-tuning a pre-trained language model, which refines the language agent prompts by reflecting on failed attempts and assigning credits of actions taken by the agent on future rewards.

```mermaid
graph LR
    Env[Environment] -- Feedback/Reward --> Retro[Retrospective Model]
    Retro -- Refined Prompt --> Agent[LLM Agent]
    Agent -- Action --> Env

    subgraph "Policy Optimization"
        Retro
    end
```

Key Components:
1. Retrospective Model: Learns from environment feedback to improve agent performance
2. Policy Optimization: Refines agent prompts based on reward signals
3. Credit Assignment: Analyzes the impact of actions on future rewards
4. Multi-Environment Learning: Adapts to various tasks and environments

![RetroFormer Table](/generative-ai/2-llm-research/llm_2_retroformer_table.png)

![RetroFormer Agent](/generative-ai/2-llm-research/llm_2_retroformer_agent.png)


