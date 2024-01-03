+++
title = "LLM Agents"
weight = 2
+++

### [RetroFormer] Retrospective LL Agents with Policy Gradient Optimization

Arxiv: [https://arxiv.org/abs/2308.02151](https://arxiv.org/abs/2308.02151) _4 Aug 2023 **Salesforce**_

This paper introduces Retroformer, a principled framework for reinforcing language agents by learning a plug-in retrospective model, which automatically refines the language agent prompts from environment feedback through policy optimization. Specifically, our proposed agent architecture can learn from arbitrary reward information across multiple environments and tasks, for iteratively fine-tuning a pre-trained language model, which refines the language agent prompts by reflecting on failed attempts and assigning credits of actions taken by the agent on future rewards

![RetroFormer Table](/generative-ai/2-llm-research/llm_2_retroformer_table.png)


![RetroFormer Agent](/generative-ai/2-llm-research/llm_2_retroformer_agent.png)


