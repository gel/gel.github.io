+++
title = "Serialize and Deserialize Binary Tree"
date = 2026-03-07
template = "interview.html"
description = "Practice tree encoding/decoding with preorder and null markers"
[extra]
difficulty = "Hard"
category = "Trees"
+++

## Problem Description

Design an algorithm to serialize and deserialize a binary tree.

Implement:

- `serialize(root)` that converts a tree to a string.
- `deserialize(data)` that converts the string back to the original tree.

In this live problem, your solution is validated using a **round-trip check**:

1. Serialize the input tree.
2. Deserialize it.
3. Return the rebuilt tree in level-order list format.

### Examples

**Example 1:**
```
Input: root = [1,2,3,null,null,4,5]
Output: [1,2,3,null,null,4,5]
```

**Example 2:**
```
Input: root = []
Output: []
```

### Constraints

- The number of nodes in the tree is in the range `[0, 10^4]`.
- `-1000 <= Node.val <= 1000`

### Hint

Preorder traversal with explicit null markers is a common reliable approach.
