+++
title = "LLM Survey"
weight = 1
+++

- [A Survey of Reshaping the GenAI Research Landscape](#survey-a-survey-of-reshaping-the-genai-research-landscape)
- [Instruction Tuning for Large Language Models](#survey-instruction-tuning-for-large-language-models)


### [Survey] A Survey of Reshaping the GenAI Research Landscape

Arxiv: [https://arxiv.org/abs/2312.10868](https://arxiv.org/abs/2312.10868) _18 Dec 2023  **IEEE**_

This comprehensive survey explored the evolving landscape of generative Artificial Intelligence (AI), with a specific focus on the transformative impacts of Mixture of Experts (MoE), multimodal learning, and the speculated advancements towards Artificial General Intelligence (AGI).

### [Survey] Instruction Tuning for Large Language Models

Arxiv: [https://arxiv.org/abs/2308.10792](https://arxiv.org/abs/2308.10792) _21 Aug 2023_

There are generally two methods for constructing instruction datasets:

• Data integration from annotated natural language datasets. In this approach,

(instruction, output) pairs are collected from existing annotated natural language datasets by using templates to transform text-label pairs to (instruction, output) pairs.

Datasets such as Flan (Longpre et al., 2023) and P3 (Sanh et al., 2021).

• Generating outputs using LLMs - (1) manually collected; or (2) expanded based on small handwritten seed instructions using LLMs. Next, the collected instructions are fed to LLMs to obtain outputs. Datasets such as InstructWild (Xue et al., 2023) and Self-Instruct (Wang et al., 2022c) are generated following this approach. For multi-turn conversational IT datasets, we can have large language models self-play different roles (user and AI assistant) to generate message

![Survey](/generative-ai/2-llm-research/llm_1_survey.png)
