+++
title = "Streamlining ML Workflows: Lessons from Nielsen Sports' 75% Cost Reduction"
date = 2024-04-04
[taxonomies]
tags = [ "Machine Learning", "SageMaker", "AWS", "Optimization", "Cost Reduction", "Multi-Modal" ]
+++

A recent AWS Machine Learning blog post co-authored by Eitan Sela, a Generative AI and Machine Learning Specialist at AWS, highlights how Nielsen Sports achieved a remarkable 75% cost reduction in their video analysis workflows. They modernized their system, which runs thousands of different machine learning models, by leveraging Amazon SageMaker multi-model endpoints (MMEs) powered by the NVIDIA Triton Inference Server.

Nielsen Sports faced the challenge of scaling a massive computer vision system that identifies over 120 million brand impressions monthly across thousands of TV channels. Their legacy architecture suffered from low GPU utilization (30-40%) and a slow, cumbersome process for deploying new models, which could take over a month.

By re-architecting their system to use SageMaker MMEs, Nielsen was able to host multiple models on a single endpoint. This led to significant improvements:

- **Dramatically Lower Costs:** A 75% reduction in operational and financial costs.
- **Increased Efficiency:** GPU utilization soared to over 80%, and the overall pipeline runtime was cut by 33%.
- **Greater Agility:** The time to deploy new ML models plummeted from over a month to under a week.

This case study is a powerful example of how adopting a multi-tenant architecture with tools like SageMaker MMEs can lead to substantial cost savings, performance gains, and increased productivity for machine learning teams.

For a deeper dive into their technical solution and results, you can read the full post here: [Nielsen Sports sees 75% cost reduction in video analysis with Amazon SageMaker multi-model endpoints](https://aws.amazon.com/blogs/machine-learning/nielsen-sports-sees-75-cost-reduction-in-video-analysis-with-amazon-sagemaker-multi-model-endpoints/).

### Resources

*   **GitHub Repository**: [SageMaker MME GPU Benchmarking](https://github.com/gel/sagemaker-mme-gpu-benchmarking)
*   **AWS Workshop**: Watch the full session with Tamir Rubinsky (VP R&D, Nielsen Sports) and myself:

<iframe width="560" height="315" src="https://www.youtube.com/embed/eDurAbkbYcQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
