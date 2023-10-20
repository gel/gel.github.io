+++
title = "Data Structures"
weight = 1
+++

- [Hashtable](#hashtable)
- [Tree](#tree)
- [Graph](#graph)
- [Heap](#heap-min-max-priority-queue)
- [Basic Data Structures](#basic-data-structures)
- [Probablistic Data Structures](#probablistic-data-structures)
--- 

### Hashtable
Constant lookup - `O(1)` - uses hash function and list of entries for collisions.

### Tree
`Binary Tree` - Has up to 2 child nodes.

`BST (Binary Search Tree)` - Binary tree where left <= parent <= right - since BST is not balanced it has `O(N)` bound.

`AVL tree` - Balanced(self-balanced) BST, common operation is rotation/shift (L, R, LR, RL) - all balanced trees will have `O(Log(N))` bound.

`B-Tree` - Balanced(self-balanced) BST, generalization of binary tree, nodes has more children. Used for databases to require less reads (n keys).

`Trie` (prefix tree) - Tree to locate specific keys (mostly strings by traversing individual characters). A node's position in the trie defines the key with which it is associated.

### Graph
`Adjacency matrix` - size N*M - binary value(0/1) to represent existance of an edge.

`Nodes and edges sets`

### Heap (Min / Max / Priority Queue)

| Operation | Bound | Explanation |
|------|------------|---------------------------------|
| Peak  | `O(1)` |  Read                          | 
| Poll/Extract/Insert | `O(Log(N))` | It is still requires to fix the underlying tree |
| Build Heap | `O(N)` | Unlike the intuition `O(N*Log(N))` is not strict and since the tree is balanced the complexity is bound to the height ` (0 * n/2) + (1 * n/4) + (2 * n/8) + ... + (h * 1)).

### Basic Data Structures

1. Array
2. Stack
3. Queue
4. Dequeue
5. List
6. Doubly-linked List

### Probablistic Data Structures

`Bloom Filter (membership problem)` - no false negatives (always return the member), built by 2D binary array of buckets (B) * number of hash functions (L) = BxL.

`Count Min Sketch  (approximate heavy-hitters problem)` - similar to bloom filter with integer(count) array, error correlates to number of L and B size (we can’t choose epsilon = 0 since it equals to infinity memory).
