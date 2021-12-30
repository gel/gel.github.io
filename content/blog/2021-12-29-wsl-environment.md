+++
title = "Unified Development Environment"
[taxonomies]
tags = [ "environment", "wsl", "linux", "windows" ]
+++

After many years of waiting patiently there is finally a reasonable way to have a unified development environment from windows named [WSL](https://docs.microsoft.com/en-us/windows/wsl/) version 2. This finally enables us developers to run a full linux environment natively in windows without virtual machine or dual-boot. Learn about the details that made it functioning.

## Native Terminal

<img src="/blog/2021-12-29-wsl-console.jpg" alt="WSL Screenshot" />

As you can see this is a terminal experience in windows enhanced with [ConEmu](https://conemu.github.io/) that provides a full linux experience. Some cool feature are:

- Support various linux versions / distros (ubuntu is the default).
- VSCode remote integration. 
- **GPU Support** ([Nvidia CUDA](https://docs.nvidia.com/cuda/wsl-user-guide/index.html)).

The only major issue that still prevents me from using it more frequently is [horrible NTFS performance](https://github.com/microsoft/WSL/issues/4197).

## Installation

```powershell
wsl --install
```