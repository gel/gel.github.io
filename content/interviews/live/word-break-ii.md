+++
title = "Word Break II"
date = 2026-03-07
template = "interview.html"
description = "Practice memoized DFS to build all valid sentence decompositions"
[extra]
difficulty = "Hard"
category = "Dynamic Programming"
+++

## Problem Description

Given a string `s` and a dictionary of strings `wordDict`, add spaces in `s` to construct all possible sentences where each word is in `wordDict`.

Return all such possible sentences in any order.

For this live runner, return sentences in **sorted lexicographic order** for deterministic checking.

### Examples

**Example 1:**
```
Input: s = "catsanddog", wordDict = ["cat","cats","and","sand","dog"]
Output: ["cat sand dog","cats and dog"]
```

**Example 2:**
```
Input: s = "catsandog", wordDict = ["cats","dog","sand","and","cat"]
Output: []
```

### Constraints

- `1 <= s.length <= 20`
- `1 <= wordDict.length <= 1000`
- `1 <= wordDict[i].length <= 10`

### Hint

Memoized DFS avoids recomputing suffix solutions.
