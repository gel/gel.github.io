+++
title = "Alien Dictionary"
date = 2026-03-07
template = "interview.html"
description = "Practice graph construction and topological sort from ordered words"
[extra]
difficulty = "Hard"
category = "Graphs"
+++

## Problem Description

There is a new alien language that uses the English alphabet, but the letter order is unknown.

You are given a list of words sorted lexicographically by that alien language. Derive a valid character order.

Return an empty string if:

- the input is invalid (prefix conflict), or
- the graph has a cycle.

### Examples

**Example 1:**
```
Input: words = ["wrt","wrf","er","ett","rftt"]
Output: "wertf"
```

**Example 2:**
```
Input: words = ["z","x","z"]
Output: ""
```

### Constraints

- `1 <= words.length <= 100`
- `1 <= words[i].length <= 100`
- All words contain lowercase English letters.

### Hint

Build precedence edges from the first differing character of adjacent words, then topologically sort.
