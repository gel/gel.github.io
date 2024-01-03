+++
title = "LLM Multi-Modal"
weight = 6
+++


### [Point-E] A System for Generating 3D Point Clouds from Complex Prompts

Arxiv: [https://arxiv.org/abs/2212.08751](https://arxiv.org/abs/2212.08751) _16 Dec 2022 **OpenAI**_

In this paper, we explore an alternative method for 3D object generation which produces 3D models in only 1-2 minutes on a single GPU. Our method first generates a single synthetic view using a text-to-image diffusion model, and then produces a 3D point cloud using a second diffusion model which conditions on the generated image. 

Using glade dataset for 2D (fine-tuned on 3D rendering).


### [CLIP] Connecting text and images

Arxiv: [https://arxiv.org/abs/2103.00020](https://arxiv.org/abs/2103.00020) _26 Feb 2021 **OpenAI**_

CLIP pre-trains an image encoder and a text encoder to predict which images were paired with which texts in our dataset. We then use this behavior to turn CLIP into a zero-shot classifier. We convert all of a dataset’s classes into captions such as “a photo of a dog” and predict the class of the caption CLIP estimates best pairs with a given image.
