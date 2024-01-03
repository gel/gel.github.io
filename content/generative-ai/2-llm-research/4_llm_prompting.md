+++
title = "LLM Prompting"
weight = 4
+++

## LLM Prompting - In-Context-Learning

### [MedPrompt] Can Generalist Foundation Models Outcompete Special-Purpose Tuning? Case Study in Medicine

Arxiv: [https://arxiv.org/abs/2311.16452](https://arxiv.org/abs/2311.16452) _28 Nov 2023 **Microsoft**_

We find that prompting innovation can unlock deeper specialist capabilities and show that GPT-4 easily tops prior leading results for medical benchmarks.

We find that GPT-4 benefits significantly from being allowed to design its prompt, specifically with coming up with its own chain-of-thought to be used for in-context learning. This observation echoes other reports that GPT-4 has an emergent self-improving capability via introspection, such as self-verification

We note that the automated chain-of-thought reasoning removes dependency on special human expertise and medical datasets. Thus, despite the name Medprompt, extending from the framing context and research trajectory of our investigation of the capabilities of GPT-4 on medical challenge problems, the methodology doesn’t include any components specifically oriented towards medicine.

Ensembling is a technique for combining the outputs of multiple model runs to arrive at a more robust or accurate result via combining the separate outputs with functions like averaging, consensus, or majority vote. Ensembling methods employing a technique referred to as self-consistency [32] use a sampling method to produce multiple outputs that are then consolidated to identify a consensus output. The diversity of the outputs can be controlled by shifting the “temperature” parameter in a model’s generation, where higher temperatures can be viewed as injecting greater amounts of randomness into the generation process. By reordering or shuffling components of a few-shot prompt, ensembling techniques can also address the order sensitivity commonly found with foundation models [26, 39], thus improving robustness.

![Chain-of-Thought](/generative-ai/2-llm-research/llm_4_cot.png)

A key challenge with this approach is that self-generated CoT rationales have an implicit risk of including hallucinated or incorrect reasoning chains. We mitigate this concern by having GPT-4 generate both a rationale and an estimation of the most likely answer to follow from that reasoning chain. If this answer does not match the ground truth label, we discard the sample entirely, under the assumption that we cannot trust the reasoning. While hallucinated or incorrect reasoning can still yield the correct final answer (i.e. false positives), we found that this simple label-verification step acts as an effective filter for false negatives.

While less severe than other foundation models, GPT-4 can exhibit a propensity to favor certain options in multiple choice answers over others (regardless of the option content), i.e., the model can show position bias [1, 16, 40]. To reduce this bias, we propose shuffling the choices and then checking consistency of the answers for the different sort orders of the multiple choice. As a result, we perform choice shuffle and self-consistency prompting. Self-consistency [32] replaces the naive single-path or greedy decoding with a diverse set of reasoning paths when prompted multiple times at some temperature> 0, a setting that introduces a degree of randomness in generations. With choice shuffling, we shuffle the relative order of the answer choices before generating each reasoning path. We then select the most consistent answer, i.e., the one that is least sensitive to choice shuffling.

![MedPrompt](/generative-ai/2-llm-research/llm_4_medprompt.png)


### [URIAL] The Unlocking Spell on Base LLMs: Rethinking Alignment via In-Context Learning

Arxiv: [https://arxiv.org/abs/2312.01552](https://arxiv.org/abs/2312.01552) _ 4 Dec 2023 **Allen Institute **_

URIAL (Untuned LLMs with Restyled In-context ALignment). Based on these findings, we rethink the alignment of LLMs by posing the research question: how effectively can we align base LLMs without SFT or RLHF? To address this, we introduce a simple, tuning-free alignment method, URIAL. URIAL achieves effective alignment purely through in-context learning (ICL) with base LLMs, requiring as few as three constant stylistic examples and a system prompt

On the other hand, a recent study, LIMA (Zhou et al., 2023), proposes the “Superficial Alignment Hypothesis,” which argues that alignment tuning might simply teach base LLMs to select a sub distribution of data formats for interacting with users. Zhou et al. (2023) demonstrates that SFT with as few as 1,000 examples can also yield high-quality aligned models, thus providing indirect support for this hypothesis.

We analyze the effect of alignment tuning by examining the token distribution shift between base LLMs and their aligned counterpart (e.g., Llama-2 and Llama2-chat). Our findings reveal that base LLMs and their alignment-tuned versions perform nearly identically in decoding on the majority of token positions (i.e., they share the top-ranked tokens). Most distribution shifts occur with stylistic tokens (e.g., discourse markers, safety disclaimers). These direct evidence strongly supports the hypothesis that alignment tuning primarily learns to adopt the language style of AI assistants, and that the knowledge required for answering user queries predominantly comes from the base LLMs themselves.

![URIAL Shift](/generative-ai/2-llm-research/llm_4_urial_shift.png)

![URIAL Distribution](/generative-ai/2-llm-research/llm_4_urial_distribution.png)

![URIAL KL-Divergence](/generative-ai/2-llm-research/llm_4_urial_kldivergence.png)

![URIAL Example](/generative-ai/2-llm-research/llm_4_urial_example.png)

URIAL encourages stylistic outputs for ICL examples and a system prompt for in-context alignment.


### [CoVE] Chain-of-Verification Reduces Hallucinations in LLM Models

Arxiv: [https://arxiv.org/abs/2309.11495](https://arxiv.org/abs/2309.11495) _25 Sep 2023 **Meta**_

We develop the Chain-of-Verification (COVE) method whereby the model first (i) drafts an initial response; then (ii) plans verification questions to fact-check its draft; (iii) answers those questions independently so the answers ar`ze not biased by other responses; and (iv) generates its final verified response.

The hallucination problem can be exacerbated due to the issue of exposure bias (Wang & Sennrich, 2020).

![Chain-of-Verification](/generative-ai/2-llm-research/llm_4_cove.png)
