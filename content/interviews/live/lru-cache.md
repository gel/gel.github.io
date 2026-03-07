+++
title = "LRU Cache"
date = 2026-03-07
template = "interview.html"
description = "Practice constant-time cache design with recency eviction"
[extra]
difficulty = "Medium"
category = "Design"
+++

## Problem Description

Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.

Support:

- `get(key)`: return value if key exists, otherwise `-1`.
- `put(key, value)`: insert/update key and evict the least recently used key when capacity is exceeded.

In this live problem, operations are simulated and your method should return outputs where:

- `get` returns an integer.
- `put` returns `null`.

### Example

```
capacity = 2
operations = ["put","put","get","put","get","put","get","get","get"]
values = [[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]

Output: [null,null,1,null,-1,null,-1,3,4]
```

### Constraints

- `1 <= capacity <= 3000`
- Up to `2 * 10^5` total operations in real interview settings.

### Follow-up

Can you achieve `O(1)` average time for both `get` and `put`?
