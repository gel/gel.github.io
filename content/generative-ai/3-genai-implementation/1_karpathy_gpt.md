+++
title = "Karpathy: Building GPT"
weight = 1
description = "My GPT learning track: micrograd and backpropagation, tiny Shakespeare, and GPT-2."
+++

My starting point was Karpathy's tiny Shakespeare example: a small model I could train and use to generate text. This track connects micrograd's explanation of backpropagation to that exercise and the larger GPT-2 implementation.

### Micrograd: Backpropagation from Scratch

References: [micrograd code](https://github.com/karpathy/micrograd) · [The spelled-out intro to neural networks and backpropagation](https://youtu.be/VMj-3S1tku0).

Micrograd makes backpropagation visible by building a small automatic differentiation engine around scalar values. Each operation records its inputs and how to pass a gradient back to them.

- **Forward pass:** calculate values and build the computation graph.
- **Chain rule:** multiply the gradient arriving from later operations by the local derivative.
- **Multiple paths:** add gradient contributions when a value influences the result through more than one path; this is why the implementation uses `+=`.
- **Backward pass:** visit nodes in reverse topological order so downstream contributions arrive before a node propagates its gradient further.

For one path through an intermediate value z:

{% math() %}
\frac{\partial L}{\partial x} = \frac{\partial L}{\partial z}\,\frac{\partial z}{\partial x}
{% end %}

The [`Value` engine](https://github.com/karpathy/micrograd/blob/master/micrograd/engine.py) explains what `loss.backward()` computes. Updating the weights using those gradients is a separate optimizer step.

### Tiny Shakespeare

Reference: [Karpathy's nanoGPT video lecture code](https://github.com/karpathy/ng-video-lecture).

Dataset: [tiny Shakespeare](https://github.com/karpathy/char-rnn/tree/master/data/tinyshakespeare) — [raw text: input.txt](https://raw.githubusercontent.com/karpathy/char-rnn/master/data/tinyshakespeare/input.txt).

The small example makes the full training cycle easier to follow: encode text, build input/next-token target batches, compute predictions and loss, update weights, then sample new text one token at a time.

### GPT-2

Reference: [Karpathy's build-nanogpt walkthrough](https://github.com/karpathy/build-nanogpt), which builds toward reproducing GPT-2 (124M).

This is the next scale of the same learning track: understanding how the model, tokenizer, data pipeline, and training loop fit together. For the compute accounting, see [why training costs approximately 6ND FLOPs](@/generative-ai/2-genai-research/2_genai_pretraining_finetuning.md#chinchilla-scaling-laws-calculating-training-flops-why-6nd).
