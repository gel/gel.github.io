+++
title = "Find Median from Data Stream"
date = 2026-03-07
template = "interview.html"
description = "Practice online median maintenance with two heaps"
[extra]
difficulty = "Hard"
category = "Heaps"
+++

## Problem Description

The median is the middle value in a sorted integer list.

- If the size is odd, median is the middle element.
- If the size is even, median is the average of the two middle elements.

Design a structure that supports continuous inserts and median queries.

In this live problem, implement a method that returns the median **after each insertion**.

### Examples

**Example 1:**
```
Input: nums = [1,2,3,4]
Output: [1.0,1.5,2.0,2.5]
```

**Example 2:**
```
Input: nums = [5,15,1,3]
Output: [5.0,10.0,5.0,4.0]
```

### Constraints

- `0 <= nums.length <= 5 * 10^4`
- `-10^5 <= nums[i] <= 10^5`

### Hint

Two heaps (max-heap for lower half, min-heap for upper half) give efficient balancing.
