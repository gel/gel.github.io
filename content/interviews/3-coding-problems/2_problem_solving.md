+++
title = "Problem Solving"
weight = 2
+++

### LRU Cache - [LC 146](https://leetcode.com/problems/lru-cache)

**Question**

> Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.

> Implement the LRUCache class:

> LRUCache(int capacity) Initialize the LRU cache with positive size capacity.
> int get(int key) Return the value of the key if the key exists, otherwise return -1.
> void put(int key, int value) Update the value of the key if the key exists. Otherwise, add the > key-value pair to the cache. If the number of keys exceeds the capacity from this operation, > evict the least recently used key.
> The functions get and put must each run in O(1) average time complexity.

**Explanation**

LRU cache is a challenging problem, the problem is mostly focused on how to store the keys efficiently for removal by time inserted. Therefore in addition to the k/v hashtable we need an additional data-structure that allows retrieval, deletion and modification. Heap / Tree based solution are all applicable solutions but requires O(Log(N)) for insertion and removal.

In this problem it is possible to do a constant time when choosing a doubly linked list which allows to add to head and evicti from tail. It also possible to perform modification in constant (move to HEAD).

This is a java implemention of DoublyLinkedList and the LRU Cache. 

**Solution**

```java
class DoublyLinkedList {
    public Node root;
    public Node tail;

    public Node addToHead(final int key) {
        if (root == null) {
            this.root = new Node(key, null, null);
            this.tail = this.root;
        } else {
            Node node = new Node(key, this.root, null);
            this.root.previous = node;
            this.root = node;
        }
        return this.root;
    }

    public void moveToHead(final Node node) throws IllegalArgumentException {
        if (this.root == null) {
            throw new RuntimeException("Invalid head state");
        }

        if (this.root == node) { // node is already head
            return;
        }

        if (this.tail == node) { // node is the tail - fix it
            this.tail = this.tail.previous;
        }

        if (node.previous != null) { // fix existing previous of node
            node.previous.next = node.next;
        }

        if (node.next != null) { // fix existing next of node
            node.next.previous = node.previous;
        }

        // set as head
        node.previous = null;
        node.next = this.root;
        this.root.previous = node;
        this.root = node;
    }

    public Node evictTail() {
        if (this.root == null) { // list is empty
            return null;
        }

        if (this.root == this.tail) {
            Node reference = this.root;
            this.root = null;
            this.tail = null;
            return reference;
        }

        Node existingTail = this.tail;
        existingTail.previous.next = null;
        this.tail = existingTail.previous;
        return existingTail;
    }
}

class LRUCache {
    final int capacity;
    int size;
    final Map<Integer, CacheEntry> cache;
    final DoublyLinkedList sortedTtlList;

    static class CacheEntry {
        public CacheEntry(int value, Node node) {
            this.value = value;
            this.node = node;
        }

        public int value;
        public Node node;
    }

    public LRUCache(int capacity) {
        this.capacity = capacity;
        this.size = 0;
        this.cache = new HashMap<>();
        this.sortedTtlList = new DoublyLinkedList();
    }

    public int get(int key) {
        if (!cache.containsKey(key)) {
            return -1;
        }

        CacheEntry entry = cache.get(key);
        sortedTtlList.moveToHead(entry.node);
        return entry.value;
    }

    public void put(int key, int value) {
        if (cache.containsKey(key)) {
            CacheEntry entry = cache.get(key);
            sortedTtlList.moveToHead(entry.node);
            entry.value = value;
        } else {
            if (this.size < this.capacity) {
                this.size = this.size + 1;
            } else {
                Node nodeToRemove = sortedTtlList.evictTail();
                cache.remove(nodeToRemove.key);
            }
            final Node newNode = sortedTtlList.addToHead(key);
            cache.put(key, new CacheEntry(value, newNode));
        }
    }
}
```