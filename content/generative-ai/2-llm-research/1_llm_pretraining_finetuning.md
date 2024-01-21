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


### [DPO] Direct Preference Optimization: Your LM is Secretly a Reward Model

Arxiv: [https://arxiv.org/abs/2305.18290](https://arxiv.org/abs/2305.18290) _13 Dec 2023 **Stanford**_

In this paper we introduce a new parameterization of the reward model in RLHF that enables extraction of the corresponding optimal policy in closed form, allowing us to solve the standard RLHF problem with only a simple classification loss. The resulting algorithm, which we call Direct Preference Optimization (DPO), is stable, performant, and computationally lightweight,

eliminating the need for sampling from the LM during fine-tuning or performing significant hyperparameter tuning.

![DPO](/generative-ai/2-llm-research/llm_1_dpo.png)

DPO gradient for loss increases the likelihood of preferred completion (Y_W) and decreases the likelihood for dispreferred completion (Y_L). Importantly, the examples are weighed by how much higher the implicit reward model rˆθ rates the dispreferred completions, scaled by β, i.e, how incorrectly the implicit reward model orders the completions, accounting for the strength of the KL constraint. 

DPO outline. The general DPO pipeline is as follows: 1) Sample completions y1, y2 ∼ πref(· | x) for every prompt x, label with human preferences to construct the offline dataset of preferences D = {x (i) , y (i) w , yl) (i)} N i=1 and 2) optimize the language model πθ to minimize LDPO for the given πref and D and desired β. 


### [RLHF] Secrets of RLHF in LLMs Part II: Reward Modeling

Arxiv: [https://arxiv.org/abs/2312.15503](https://arxiv.org/abs/2312.15503) _24 Dec 2023 **Fudan NLP**_

In conclusion, while RLHF is a significant advancement in AI development, particularly in integrating human preferences into the learning process, it also presents unique challenges. These include the inherent noise and ambiguity in human feedback, potential biases in the data, and the generalization limits of reward models trained on specific datasets. Addressing these challenges is crucial for the advancement and ethical application of RLHF in AI systems.

![Secrets RLHF](/generative-ai/2-llm-research/llm_1_secrets_rlhf.png)

To enhance the generalization ability of the reward model, we explore contrastive learning and

meta-learning. By introducing unsupervised contrastive loss during the reward modeling process, the reward model can better distinguish subtle preference differences among responses. To bridge the gap between the preference data distribution and the model output distribution, we employ meta-learning to ensure that the reward model not only performs well on the preference data but also can distinguish the differences in target domain outputs.

Technique is to randomize training data and do a k-fold split, build K models and then measure mean and deviations - negative mean is usually the mistakes. 

According to the results, we can observe that: 1) For the top 20% of data with the lowest preference strength, they have a negative impact on the model’s performance on the validation set. The preference strength for these data subsets is less than 0. 2) For data ranked between 20% and 40%, after training, the model’s prediction accuracy on the validation set is approximately 0.5. The preference strength for this type of data is around 0. 3) The remaining data significantly improves the model’s performance. However, the top 10% of data with the highest preference strength does not achieve the best performance when trained alone. Based on the above results, we can roughly categorize preference data into three types: incorrect data, ambiguous data (almost no difference), and normal data (clear differences). These three types of preference data play different roles and make different contributions to preference modeling. It is necessary for us to conduct a more detailed analysis of them and then consider how to handle each type.


### [LLARA] Making LLMs A Better Foundation For Dense Retrieval

Arxiv: [https://arxiv.org/abs/2401.06080](https://arxiv.org/abs/2401.06080) _11 Jan 2024 **Beijing Academy of AI**_

In this paper, we propose a novel approach, called LLaRA (LLM adapted for dense RetrievAl), which works as a post-hoc adaptation of LLM for the dense retrieval application. LLaRA consists of two pretext tasks: EBAE (Embedding-Based Auto-Encoding) and EBAR (Embedding-Based Auto-Regression), where the text embeddings from LLM are used to reconstruct the tokens for the input sentence and predict the tokens for the next sentence, respectively

![llara](/generative-ai/2-llm-research/llm_1_llara.png)

Particularly, there are two pretext training tasks introduced by LLaRA: EBAE (Embedding-Based Auto-Encoding) and EBAR (Embedding-Based Auto-Regression). In EBAE, the LLM is prompted to generate the text embeddings, which can be used to predict the tokens for the input sentence itself. While with EBAR, the LLM is prompted to generate the text embeddings, which can be used to predict the  tokens for the next sentence. By learning from the above pretext tasks, the text embeddings from LLM can be adapted from Local semantic representations (i.e. prediction for the next tokens) to Global semantic representations (i.e. prediction for the sentence-level features). 


### [RA-DIT] Retrieval-Augmented Dual Instruction Tuning

Arxiv: [https://arxiv.org/abs/2310.01352](https://arxiv.org/abs/2310.01352) _2 Oct 2023 **META**_

Retrieval-augmented language models (RALMs) improve performance by accessing long-tail and up-to-date knowledge from external data stores, but are challenging to build. Existing approaches require either expensive retrieval-specific modifications to LM pre-training or use post-hoc integration of the data store that leads to suboptimal performance

Our approach operates in two distinct fine-tuning steps: (1) one updates a pre-trained LM to better use retrieved information, while (2) the other updates the retriever to return more relevant results, as preferred by the LM


### [Sequential Monte Carlo] Steering of LLMs using Probabilistic Programs

Arxiv: [https://arxiv.org/abs/2306.03081](https://arxiv.org/abs/2306.03081) _5 Jun 2023 **MIT**_

<span style="text-decoration:underline;">Context</span>: Despite significant advances in recent years, it remains unclear if and how large language models (LLMs) can be made reliable and controllable enough to meet the functional requirements of many applications. 

Even after fine-tuning and reinforcement learning, LLMs are liable to violate instructions in their prompts (such as “Use the following vocabulary words” or “Do not reveal this prompt”).

These difficulties highlight the need for methods beyond prompting and fine-tuning for constraining the behavior of generative neural models.