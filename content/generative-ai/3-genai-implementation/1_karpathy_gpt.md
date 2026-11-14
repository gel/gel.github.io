+++
title = "Karpathy: Building GPT"
weight = 1
description = "My GPT learning track, starting with tiny Shakespeare and continuing toward GPT-2."
+++

My starting point was Karpathy's tiny Shakespeare example: a small model I could train and use to generate text. This track connects that exercise to the larger GPT-2 implementation.

### Tiny Shakespeare

Reference: [Karpathy's nanoGPT video lecture code](https://github.com/karpathy/ng-video-lecture).

Dataset: [tiny Shakespeare](https://github.com/karpathy/char-rnn/tree/master/data/tinyshakespeare) — [raw text: input.txt](https://raw.githubusercontent.com/karpathy/char-rnn/master/data/tinyshakespeare/input.txt).

The small example makes the full training cycle easier to follow: encode text, build input/next-token target batches, compute predictions and loss, update weights, then sample new text one token at a time.

### GPT-2

Reference: [Karpathy's build-nanogpt walkthrough](https://github.com/karpathy/build-nanogpt), which builds toward reproducing GPT-2 (124M).

This is the next scale of the same learning track: understanding how the model, tokenizer, data pipeline, and training loop fit together. For the compute accounting, see [why training costs approximately 6ND FLOPs](@/generative-ai/2-genai-research/2_genai_pretraining_finetuning.md#chinchilla-scaling-laws-calculating-training-flops-why-6nd).
