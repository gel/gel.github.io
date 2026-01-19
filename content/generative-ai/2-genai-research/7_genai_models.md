+++
title = "GenAI Models"
weight = 7
+++


### [Survey] A Survey of Reshaping the GenAI Research Landscape

Arxiv: [https://arxiv.org/abs/2312.10868](https://arxiv.org/abs/2312.10868) _18 Dec 2023  **IEEE**_

This survey explores Generative AI (AI), focusing on Mixture of Experts (MoE), multimodal learning, and the path towards Artificial General Intelligence (AGI).


### [Mixtral] Mixtral of Experts

Arxiv: [https://arxiv.org/abs/2401.04088](https://arxiv.org/abs/2401.04088) _8 Jan 2024 **Mixtral.ai**_

We introduce Mixtral 8x7B, a Sparse Mixture of Experts (SMoE) language model. Mixtral has the same architecture as Mistral 7B, with the difference that each layer is composed of 8 feedforward blocks (i.e. experts).


![Mistral Experts](/generative-ai/2-genai-research/llm_7_mistral1.png)

 - G denotes n dimensionality of the gating network (router), E is the expert network.

Consecutive tokens are often assigned to the same experts. In fact, we observe some degree of positional locality in The Pile datasets. Table 5 shows the proportion of consecutive tokens that get the same expert assignments per domain and layer. Figures are not showing it clearly.

![Mistral Decoding](/generative-ai/2-genai-research/llm_7_mistral2.png)


### [Gemini] A Family of Highly Capable Multimodal Models

Arxiv: [https://arxiv.org/abs/2312.11805](https://arxiv.org/abs/2312.11805) _19 Dec 2023 **Google**_

The reasoning capabilities of large language models show promise toward building generalist agents that can tackle more complex multi-step problems.

![Gemini Sample](/generative-ai/2-genai-research/llm_7_gemini1.png)

![Gemini Architecture](/generative-ai/2-genai-research/llm_7_gemini2.png)

### [ModernBERT] Modern Bidirectional Encoder

Arxiv: [https://arxiv.org/abs/2412.13663](https://arxiv.org/abs/2412.13663) _18 Dec 2024_

The paper introduces ModernBERT, a new family of encoder-only transformer models that brings modern optimizations to BERT-style architectures.

Key Features:
1. Architectural Improvements:
   - Uses GeGLU activation
   - RoPE positional embeddings
   - Alternating local-global attention
   - Native 8192 sequence length
   - Optimized for efficient inference on common GPUs
   - Full model unpadding for better efficiency

2. Training:
   - Trained on 2 trillion tokens
   - Includes code data in training mixture
   - Uses modern BPE tokenizer with 50,368 vocabulary size

3. Unique Advantages:
   - Successfully combines modern LLM architecture improvements with encoder-only models
   - Achieves better performance while maintaining high efficiency
   - Represents first major Pareto improvement over older encoders like BERT
   - Code-Aware Design: Uses a code-aware tokenizer that can properly handle programming syntax
   - The code training makes ModernBERT uniquely suited for code-related tasks while maintaining strong performance on traditional NLP tasks

Limitations:
- MLM-only objective (Masked Language Modeling)
- Not trained with RTD (Replaced Token Detection) which might hurt classification results

### [GLiNER] Generalist Model for NER using Bidirectional Transformer

Arxiv: [https://arxiv.org/abs/2311.08526](https://arxiv.org/abs/2311.08526) _14 Nov 2023_

```mermaid
flowchart LR
    Text[Input Text] --> Enc[Bidirectional\nEncoder]
    Types["Entity Types\n(any types)"] --> Enc
    Enc --> Spans[Span\nRepresentations]
    Enc --> Entities[Entity\nRepresentations]
    Spans --> Match{Match in\nLatent Space}
    Entities --> Match
    Match --> NER["Named Entities\n(Parallel Extraction)"]

    style NER fill:#c8e6c9,color:#000
```

Key Points:

Problem & Solution:
- Traditional NER models are limited to predefined entity types
- GLiNER introduces a compact model that can identify any type of entity
- Uses bidirectional transformer encoder for parallel entity extraction

Architecture:
- Uses bidirectional transformer (like BERT/DeBERTa) as backbone
- Components:
  1. Pre-trained textual encoder
  2. Span representation module
  3. Entity representation module
- Treats NER as matching entity types with text spans in latent space

Performance:
- Parallel entity extraction vs sequential generation in LLMs
- Compact design (50M-300M parameters) vs billions in LLMs
- Effective negative entity sampling during training
- Entity type dropping as regularization technique

Limitations:
- Lower performance on informal text (e.g., tweets)
- Reduced effectiveness on non-Latin scripts
- Room for improvement in low-resource languages
