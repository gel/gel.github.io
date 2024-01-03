+++
title = "LLM Pretraining & Fine-tuning"
weight = 1
+++


### [Survey] Instruction Tuning for Large Language Models

Arxiv: [https://arxiv.org/abs/2308.10792](https://arxiv.org/abs/2308.10792) _21 Aug 2023_

There are generally two methods for constructing instruction datasets:

• Data integration from annotated natural language datasets. In this approach,

(instruction, output) pairs are collected from existing annotated natural language datasets by using templates to transform text-label pairs to (instruction, output) pairs.

Datasets such as Flan (Longpre et al., 2023) and P3 (Sanh et al., 2021).

• Generating outputs using LLMs - (1) manually collected; or (2) expanded based on small handwritten seed instructions using LLMs. Next, the collected instructions are fed to LLMs to obtain outputs. Datasets such as InstructWild (Xue et al., 2023) and Self-Instruct (Wang et al., 2022c) are generated following this approach. For multi-turn conversational IT datasets, we can have large language models self-play different roles (user and AI assistant) to generate message

![Survey](/generative-ai/2-llm-research/llm_1_survey.png)

### [RA-DIT] Retrieval-Augmented Dual Instruction Tuning

Arxiv: [https://arxiv.org/abs/2310.01352](https://arxiv.org/abs/2310.01352) _2 Oct 2023 **META**_

Retrieval-augmented language models (RALMs) improve performance by accessing long-tail and up-to-date knowledge from external data stores, but are challenging to build. Existing approaches require either expensive retrieval-specific modifications to LM pre-training or use post-hoc integration of the data store that leads to suboptimal performance

Our approach operates in two distinct fine-tuning steps: (1) one updates a pre-trained LM to better use retrieved information, while (2) the other updates the retriever to return more relevant results, as preferred by the LM


### [Sequential Monte Carlo] Steering of LLMs using Probabilistic Programs

Arxiv: [https://arxiv.org/abs/2306.03081](https://arxiv.org/abs/2306.03081) _5 Jun 2023 **MIT**_

<span style="text-decoration:underline;">Context</span>: Despite significant advances in recent years, it remains unclear if and how large language models (LLMs) can be made reliable and controllable enough to meet the functional requirements of many applications. 

Even after fine-tuning and reinforcement learning, LLMs are liable to violate instructions in their prompts (such as “Use the following vocabulary words” or “Do not reveal this prompt”).

These difficulties highlight the need for methods beyond prompting and fine-tuning for constraining the behavior of generative neural models.