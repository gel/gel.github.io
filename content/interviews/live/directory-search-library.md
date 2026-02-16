+++
title = "Directory Search Library"
date = 2026-02-16
template = "interview.html"
description = "Design a composable matcher-based search over a directory tree"
[extra]
difficulty = "Medium"
category = "Logical and Maintainable"
+++

## Problem Description

Implement a small in-memory directory search API.

You are given a directory tree where each node has:

- `name: str`
- `is_file: bool`
- `size: int` (bytes, only meaningful for files)
- `children: List[node]` (only for directories)

Write:

```text
findMatchingPaths(root, min_size, extension) -> List[str]
```

Requirements:

- Return file paths that match all provided filters.
- If `min_size` is `None`, ignore size filter.
- If `extension` is `None`, ignore extension filter.
- Use composition-style matcher logic, not hardcoded nested conditions.
- Output should be sorted lexicographically for deterministic results.

### Example

```text
min_size = 5_000_000
extension = "xml"
=> return all .xml files >= 5MB
```

### Follow-up

- Add `or`/`not` matchers.
- Add cycle protection if symbolic links are introduced.
