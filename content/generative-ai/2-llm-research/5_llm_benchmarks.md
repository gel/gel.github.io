+++
title = "LLM Benchmarks & Evaludations"
weight = 5
+++


### [Benchmark] Generating Benchmarks for Factuality Evaluation of Language Models

Arxiv: [https://arxiv.org/abs/2307.06908](https://arxiv.org/abs/2307.06908) _13 Jul 2023  **AI21 Labs**_

The key idea is automatically perturbing factual statements taken from the corpus to create a constant number of false variations (hereafter, 3) for each true statement (Figure 1). The LM’s FACTOR accuracy on our benchmark is defined as the percentage of examples for which it assigns higher likelihood to the factual completion than to any of the false variations. 

![Chain-of-Verification](/generative-ai/2-llm-research/llm_5_benchmark.png)
