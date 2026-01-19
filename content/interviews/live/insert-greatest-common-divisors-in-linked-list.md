+++
title = "Insert GCD in Linked List"
date = 2026-01-19
template = "interview.html"
description = "Practice linked list manipulation and math"
[extra]
difficulty = "Medium"
category = "Linked Lists"

+++

## Problem Description

Given the head of a linked list `head`, in which each node contains an integer value.

Between every pair of adjacent nodes, insert a new node with a value equal to the **greatest common divisor** of them.

Return *the linked list after insertion*.

The **greatest common divisor** of two numbers is the largest positive integer that evenly divides both numbers.

### Examples

**Example 1:**
```
Input: head = [18,6,10,3]
Output: [18,6,6,2,10,1,3]
Explanation: 
- We insert the GCD of 18 and 6 = 6 between the 1st and 2nd nodes.
- We insert the GCD of 6 and 10 = 2 between the 2nd and 3rd nodes.
- We insert the GCD of 10 and 3 = 1 between the 3rd and 4th nodes.
```

**Example 2:**
```
Input: head = [7]
Output: [7]
Explanation: There are no pairs of adjacent nodes, so we return the initial linked list.
```

### Constraints

- The number of nodes in the list is in the range `[1, 5000]`.
- `1 <= Node.val <= 1000`
