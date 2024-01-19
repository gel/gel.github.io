+++
title = "GenAI Real Face Superhero"
[taxonomies]
tags = [ "Generative AI", "Dall-E", "ChatGPT", "FaceSwap" ]
+++

Generative AI has been phenomenal in everything related to productivity given inputs such as free-text or code.
The new image or multi-modal based foundation models has made tremendous improvements and I wanted to explore them.

My goal was generating superheroes portraits using a ChatGPT Pro subscription (Dall-E is included).

## Generating Superheroes Portraits with ChatGPT (Dall-E)

ChatGPT (Dall-E) will let you draw abstract superheroes but it is currently not possible to generate them from real people photos.

The generic response Dall-E will output is: "I'm sorry, but I'm unable to use real individuals' faces from images to create new images. If you have any other requests or need assistance with something else, feel free to ask!" 

Therefore, we will leverage Dall-E just to generate a generic face superhero (cartoonish or real) and later on replace it using a different product.

My project was generating a superhero named "דני כוסברו" which is a humorous word-play for a famous news broadcaster named "Dani Kushmaro" and Cilantro.

In order to generate a portrait I've uploaded the portrait of the reporter and asked ChatGPT:

"Draw a real person face that has coriander. The person should look like a superhero"

This is the output image I got:

<img src="/blog/2024-01-16-dalle-corianderman1.png" alt="Coriander Man" width="300" />

As you can see this is a great representation for a first try but the biggest problem that I've learnt later is that the coriander on the face makes it very difficult for the face-swap tool later.

In order to fix it, I've asked ChatGPT to fix it by writing:

"Draw a portrait of a person with their face merged with coriander, make sure the face is not too hidden so it can be easily replaced with a real person"

Output image came exactly as I wanted it to be:

<img src="/blog/2024-01-16-dalle-corianderman2.png" alt="Coriander Man Fixed" width="300" />

Let's move to the second part of replacing it with the reporter real face.

## Face Swap

InsightFace is an open source 2D&3D deep face analysis library with more than 15k stars on github.

The product that is built on top of this library and more features is called picsi.ai and it is possible to set up a discord bot for free with 50 credits to leverage the face-swap functionality.

This is the [swapping_discord](https://github.com/deepinsight/insightface/tree/master/web-demos/swapping_discord) github link but the process is super simple so I will describe it here.

Step-by-step guide:

1. Refer to this link to register Discord app, create a new chat room, and invite the Midjourney bot to the chat room.

1. Invite the InsightFaceSwap bot to the chat room by this link: [Discord Invite Link](https://discord.com/api/oauth2/authorize?client_id=1090660574196674713&permissions=274877945856&scope=bot).

1. Use ``/saveid`` command to register your person id with image/features.

1. Use ```/swapid``` command to swap the input image with a given saved ID.

The final photos for the superhero are:

<img src="/blog/2024-01-16-dani-kusbaro1.webp" alt="Coriander Man Fixed" width="300" />

<img src="/blog/2024-01-16-dani-kusbaro2.webp" alt="Coriander Man Fixed" width="300" />

