+++
title = "Reverse Polish Notation"
date = 2026-01-19
template = "interview.html"
description = "Practice evaluating RPN expressions with AI interviewer feedback"
[extra]
difficulty = "Medium"
category = "Stacks"

+++

## Problem Description

Evaluate the value of an arithmetic expression in **Reverse Polish Notation** (RPN).

Valid operators are `+`, `-`, `*`, and `/`. Each operand may be an integer or another expression.

**Note:** Division between two integers should truncate toward zero.

It is guaranteed that the given RPN expression is always valid. That means the expression would always evaluate to a result, and there will not be any division by zero operation.

### Examples

**Example 1:**
```
Input: tokens = ["2","1","+","3","*"]
Output: 9
Explanation: ((2 + 1) * 3) = 9
```

**Example 2:**
```
Input: tokens = ["4","13","5","/","+"]
Output: 6
Explanation: (4 + (13 / 5)) = 6
```

**Example 3:**
```
Input: tokens = ["10","6","9","3","+","-11","*","/","*","17","+","5","+"]
Output: 22
```

### Constraints

- `1 <= tokens.length <= 10^4`
- `tokens[i]` is either an operator: `"+"`, `"-"`, `"*"`, or `"/"`, or an integer in the range `[-200, 200]`.

### Hint

Think about what data structure allows you to easily access the most recently added elements.
