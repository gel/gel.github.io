+++
title = "GenAI Prompting"
weight = 4
+++

## LLM Prompting - In-Context-Learning

### [LLMLingua] Compressing Prompts for Accelerated Inference of LLMs

Arxiv: [https://arxiv.org/abs/2310.05736](https://arxiv.org/abs/2310.05736) _Oct 2023 **Microsoft**_

```mermaid
flowchart LR
    Input["Long Prompt\n(10k+ tokens)"] --> BC[Budget Controller]
    BC --> Demo[Demonstrations]
    BC --> Inst[Instructions]
    BC --> Q[Questions]
    Demo --> |High compression| TIC[Token Iterative\nCompression]
    Inst --> |Low compression| TIC
    Q --> |Low compression| TIC
    TIC --> IT[Instruction Tuning]
    IT --> Output["Compressed Prompt\n(~500 tokens)"]
```

Key Components:
1. Budget Controller
   - Allocates different compression ratios to prompt components
   - Prioritizes instructions and questions over demonstrations
   - Maintains semantic integrity under high compression

2. Token-level Iterative Compression
   - Divides target prompt into segments
   - Uses smaller model for perplexity distribution
   - Concatenates compressed segments for accurate probability estimation

3. Instruction Tuning
   - Aligns distribution between language models
   - Improves compression quality

### [TOT] Tree of Thoughts: Deliberate Problem Solving with LLMs

Arxiv: [https://arxiv.org/abs/2305.10601](https://arxiv.org/abs/2305.10601) _17 May 2023_

```mermaid
flowchart TD
    Problem[Problem] --> T1[Thought 1]
    Problem --> T2[Thought 2]
    Problem --> T3[Thought 3]
    T1 --> |Evaluate| T1a["Thought 1.1 ✓"]
    T1 --> T1b[Thought 1.2]
    T2 --> |Evaluate| T2a[Thought 2.1]
    T2 --> T2b["Thought 2.2 ✓"]
    T1a --> |Search| Sol1["Solution ★"]
    T2b --> Sol2[Solution]

    style T1a fill:#90EE90,color:#000
    style T2b fill:#90EE90,color:#000
    style Sol1 fill:#FFD700,color:#000
```

Key Features:
- Frames problems as search over a tree
- Each node represents a partial solution
- Four key components:
  1. Decomposition of intermediate process
  2. Generation of potential thoughts
  3. Heuristic evaluation of states
  4. Search algorithm selection

### [COT] Chain-of-Thought Prompting Elicits Reasoning in LLMs

Arxiv: [https://arxiv.org/abs/2201.11903](https://arxiv.org/abs/2201.11903) _Jan 2022_

```mermaid
flowchart LR
    subgraph Standard["Standard Prompting"]
        Q1[Question] --> A1[Answer]
    end

    subgraph COT["Chain-of-Thought"]
        Q2[Question] --> S1["Step 1: ..."]
        S1 --> S2["Step 2: ..."]
        S2 --> S3["Step 3: ..."]
        S3 --> A2[Answer]
    end

    style COT fill:#e1f5fe,color:#000
```

Limitations:
- No guarantee of correct reasoning paths
- Manual annotation costs for few-shot setting
- Potential for both correct and incorrect answers

### [Self-Discover] LLM Self-Compose Reasoning Structures

Arxiv: [https://arxiv.org/abs/2402.03620](https://arxiv.org/abs/2402.03620) _6 Feb 2024_

```mermaid
flowchart TD
    subgraph Stage1["Stage 1: Compose Structure"]
        Task[Task Description] --> Select[SELECT relevant modules]
        Select --> Adapt[ADAPT to task]
        Adapt --> Implement[IMPLEMENT as JSON]
    end

    subgraph Stage2["Stage 2: Solve"]
        Instance[Problem Instance] --> Apply[Apply Structure]
        Apply --> Answer[Final Answer]
    end

    Implement --> Instance

    style Stage1 fill:#fff3e0,color:#000
    style Stage2 fill:#e8f5e9,color:#000
```

Two-Stage Process:
1. Stage 1: Task-level reasoning structure
   - Uses three actions to guide LLM
   - Generates coherent reasoning structure

2. Stage 2: Instance solving
   - Follows self-discovered structure
   - Arrives at final answer

### [Intent-based Prompt Calibration] Enhancing prompt optimization with synthetic boundary cases

Arxiv: [https://arxiv.org/abs/2402.03099](https://arxiv.org/abs/2402.03099) _5 Feb 2024_

```mermaid
flowchart TD
    Start[Initial Prompt] --> Gen[Generate Boundary Cases]
    Gen --> Eval{Evaluate on\nBoundary Cases}
    Eval --> |Failures found| Improve[Suggest Improved Prompt]
    Improve --> Gen
    Eval --> |No improvement| End[Final Optimized Prompt]

    style End fill:#90EE90,color:#000
```

Process:
1. Start with initial prompt and task description
2. Iteratively:
   - Generate challenging boundary cases
   - Evaluate current prompt
   - Suggest improved prompt
3. Terminate when no improvement or max iterations reached

### [Text2SQL Prompting] Enhancing Few-shot Text2SQL Capabilities of LLM

Arxiv: [https://arxiv.org/abs/2311.16452](https://arxiv.org/abs/2311.16452) _Nov 2023 **Yale**_

Key Findings:
- Dual emphasis on diversity and similarity in examples
- Database knowledge augmentation benefits
- Code sequence representation for databases
- Sensitivity to number of demonstration examples

### [MedPrompt] Can Generalist FM Outcompete Special-Purpose Tuning?

Arxiv: [https://arxiv.org/abs/2311.16452](https://arxiv.org/abs/2311.16452) _28 Nov 2023 **Microsoft**_

```mermaid
flowchart LR
    Q[Medical\nQuestion] --> CoT[Self-Generated\nChain-of-Thought]
    CoT --> Ens[Ensemble with\nSelf-Consistency]
    Ens --> Shuffle[Choice\nShuffling]
    Shuffle --> Verify[Label\nVerification]
    Verify --> A["Answer\n(90%+ accuracy)"]

    style A fill:#FFD700,color:#000
```

Key Features:
- Self-generated chain-of-thought
- Ensembling with self-consistency
- Choice shuffling for bias reduction
- Label verification for hallucination mitigation

### [URIAL] Rethinking Alignment via In-Context Learning

Arxiv: [https://arxiv.org/abs/2312.01552](https://arxiv.org/abs/2312.01552) _4 Dec 2023 **Allen Institute**_

```mermaid
flowchart LR
    subgraph Traditional["SFT/RLHF Alignment"]
        Base1[Base LLM] --> SFT[Supervised\nFine-tuning]
        SFT --> RLHF[RLHF]
        RLHF --> Aligned1[Aligned LLM]
    end

    subgraph URIAL["URIAL (Tuning-Free)"]
        Base2[Base LLM] --> ICL["3 Style Examples\n+ System Prompt"]
        ICL --> Aligned2[Aligned LLM]
    end

    style URIAL fill:#e8f5e9,color:#000
```

Key Points:
- Tuning-free alignment method
- Requires only three stylistic examples
- Supports Superficial Alignment Hypothesis
- Token distribution analysis shows minimal shifts

### [CoVE] Chain-of-Verification Reduces Hallucinations in LLM Models

Arxiv: [https://arxiv.org/abs/2309.11495](https://arxiv.org/abs/2309.11495) _25 Sep 2023 **Meta**_

```mermaid
flowchart TD
    Q[Question] --> Draft["1. Draft Response"]
    Draft --> Plan["2. Plan Verification\nQuestions"]
    Plan --> V1["Q1: Is X true?"]
    Plan --> V2["Q2: Is Y correct?"]
    Plan --> V3["Q3: Does Z hold?"]
    V1 --> |Independent| A1["A1: Yes/No"]
    V2 --> |Independent| A2["A2: Yes/No"]
    V3 --> |Independent| A3["A3: Yes/No"]
    A1 --> Final["4. Final Verified\nResponse"]
    A2 --> Final
    A3 --> Final

    style Final fill:#90EE90,color:#000
```

Process:
1. Draft initial response
2. Plan verification questions
3. Answer questions independently
4. Generate final verified response
