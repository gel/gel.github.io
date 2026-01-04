+++
title = "LLM Models"
weight = 8
+++


### [Mixtral] Mixtral of Experts

Arxiv: [https://arxiv.org/abs/2401.04088](https://arxiv.org/abs/2401.04088) _8 Jan 2024 **Mixtral.ai**_

We introduce Mixtral 8x7B, a Sparse Mixture of Experts (SMoE) language model. Mixtral has the same architecture as Mistral 7B, with the difference that each layer is composed of 8 feedforward blocks (i.e. experts).


![Mistral Experts](/generative-ai/2-llm-research/llm_7_mistral1.png)

 - G denotes n dimensionality of the gating network (router), E is the expert network.

Consecutive tokens are often assigned to the same experts. In fact, we observe some degree of positional locality in The Pile datasets. Table 5 shows the proportion of consecutive tokens that get the same expert assignments per domain and layer. Figures are not showing it clearly.

![Mistral Decoding](/generative-ai/2-llm-research/llm_7_mistral2.png)


### [Gemini] A Family of Highly Capable Multimodal Models

Arxiv: [https://arxiv.org/abs/2312.11805](https://arxiv.org/abs/2312.11805) _19 Dec 2023 **Google**_

The reasoning capabilities of large language models show promise toward building generalist agents that can tackle more complex multi-step problems.

![Gemini Sample](/generative-ai/2-llm-research/llm_7_gemini1.png)

![Gemini Architecture](/generative-ai/2-llm-research/llm_7_gemini2.png)
