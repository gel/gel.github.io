+++
title = "DeepSeek: TorchFeather"
weight = 2
description = "Code-reading notes from studying DeepSeek's implementation in TorchFeather, starting with output-weight initialization."
updated = 2026-11-14
+++

Notes while following Umar Jamil's *Building a distributed training framework from first principles* and working through [TorchFeather](https://github.com/hkproj/torchfeather). I use these notes to explain the implementation to myself as I study it.

### Output Initialization: Why 1/√dim?

In [`DeepSeekV3Model.init_weights`](https://github.com/hkproj/torchfeather/blob/main/torchfeather/model/model.py#L387):

```python
final_out_std = self.model_args.dim**-0.5
```

This sets the **initial standard deviation of the output layer's weights**. The output layer maps \\( d = \texttt{dim} \\) hidden features to vocabulary logits; `final_out_std` is not the measured standard deviation of those logits.

#### Goal: Preserve the Input Variance

For one output logit, write \\( y = \sum_{j=1}^{d} w_j x_j \\), summing over \\( d \\) input features. We choose the weight scale so \\( \operatorname{Var}(y) \approx \operatorname{Var}(x_j) \\): one output should have roughly the variance of one input feature. This is the forward variance-preservation argument behind fan-in initialization; see [Glorot and Bengio, Section 4.2](https://proceedings.mlr.press/v9/glorot10a/glorot10a.pdf).

#### Which Variables Are Independent?

For the simple derivation, assume each input feature is centered with variance \\( v \\), and the initialized weights are independent of the input and of each other, with mean zero and variance \\( \sigma_w^2 \\).

**x and y are dependent**: y is computed from x. Independence here refers to the randomly initialized weights and the input, not to the input and output.

For one product, independence lets us factor its second moment, while zero means remove the mean term:

{% math() %}
\operatorname{Var}(w_j x_j) = \mathbb{E}[w_j^2]\,\mathbb{E}[x_j^2] = \sigma_w^2 v
{% end %}

For a sum, variance generally includes covariance terms:

{% math() %}
\begin{aligned}
\operatorname{Var}(y) &= \sum_{j=1}^{d} \operatorname{Var}(w_j x_j) \\
&\quad + 2\sum_{j<k} \operatorname{Cov}(w_j x_j,\, w_k x_k)
\end{aligned}
{% end %}

The independent, zero-mean weights make those cross-covariances zero at initialization. The input features themselves need not be independent for this cancellation.

#### Solve for the Weight Standard Deviation

There are \\( d \\) products, so:

{% math() %}
\operatorname{Var}(y) = d\,\sigma_w^2 v
{% end %}

To preserve a nonzero input variance \\( v \\):

{% math() %}
\begin{aligned}
d\,\sigma_w^2 v &= v \\
\sigma_w^2 &= \frac{1}{d} \\
\sigma_w &= \frac{1}{\sqrt{d}}
\end{aligned}
{% end %}

The variance is \\( 1/d \\); the standard deviation passed to the initializer is its **square root**. For \\( d = 4096 \\), this gives \\( \frac{1}{64} = 0.015625 \\). Here \\( d \\) is the hidden width, not the vocabulary size.

#### Connect the Derivation to RMSNorm

TorchFeather applies RMSNorm before the output projection. RMSNorm controls the **mean square**, without forcing the input mean to zero. Holding that hidden vector \\( x \\) fixed and varying the initial weights gives:

{% math() %}
\operatorname{Var}_{W}(y\mid x) = \sigma_w^2\sum_{j=1}^{d} x_j^2 \approx \sigma_w^2 d
{% end %}

Thus \\( \sigma_w^2 = 1/d \\) keeps initial logit variance around 1 even without the centered-input simplification above. The code truncates the normal distribution at \\( \pm 3\sigma \\), so this is approximate scale control at initialization, not an exact variance constraint enforced throughout training.

### Residual Initialization: Why Scale With Depth?

Each residual branch adds to the running stream. Assuming negligible covariance and variance **v** per branch, **L** additions give:

{% math() %}
\operatorname{Var}(x_L)\approx\operatorname{Var}(x_0)+Lv
{% end %}

A transformer has **two residual additions per block**: attention and FFN. Across L blocks, the added variance is roughly **2Lv**. Scaling branch outputs by **1/√(2L)** scales their variance by **1/(2L)**, controlling growth with depth. This is a simplifying initialization argument, not a guarantee throughout training.

[TorchFeather](https://github.com/hkproj/torchfeather/blob/main/torchfeather/model/model.py) scales the residual output weights using:

```python
self.weight_init_std = 0.02 / (2 * (layer_id + 1)) ** 0.5
```

It uses the **current block's depth**, not total model depth L, so its schedule differs from the constant scale in the argument above. Several internal attention projections keep `std=0.02`.

**Why 0.02?** It is an established base scale: [OpenAI's GPT-2 implementation](https://github.com/openai/gpt-2/blob/master/src/model.py) uses `w_init_stdev=0.02`. That documents precedent, not why TorchFeather chose it. **A plausible intuition** is that it is on the scale of fan-in initialization for widths of a few thousand: **1/√2500 = 0.02**. This numerical comparison does not derive a universal constant or prove the author's rationale.

**Remember:** **0.02 sets the base weight scale; the depth factor reduces residual accumulation.** Variance scaling explains the factor, not the exact base value.

### Related Research Notes

- [Shared and routed experts](@/generative-ai/2-genai-research/6_genai_models.md#deepseekmoe-shared-and-routed-experts)
- [Active parameters and training FLOPs](@/generative-ai/2-genai-research/2_genai_pretraining_finetuning.md#moe-scaling-active-parameters-granularity-and-training-flops)
- [RoPE, Position Interpolation, and YaRN](@/generative-ai/2-genai-research/3_genai_optimization.md#rope-roformer-enhanced-transformer-with-rotary-position-embedding)
