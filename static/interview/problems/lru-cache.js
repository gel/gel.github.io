window.problemConfig = {
  methodName: "runLRU",
  starterCode: `from typing import List, Optional
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache = OrderedDict()

    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value

        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)

class Solution:
    def runLRU(
        self,
        capacity: int,
        operations: List[str],
        values: List[List[int]]
    ) -> List[Optional[int]]:
        cache = LRUCache(capacity)
        output: List[Optional[int]] = []

        for op, args in zip(operations, values):
            if op == "put":
                cache.put(args[0], args[1])
                output.append(None)
            elif op == "get":
                output.append(cache.get(args[0]))
            else:
                raise ValueError("Unknown operation")

        return output`,
  testCases: [
    {
      input: {
        capacity: 2,
        operations: ["put", "put", "get", "put", "get", "put", "get", "get", "get"],
        values: [[1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]
      },
      expected: [null, null, 1, null, -1, null, -1, 3, 4]
    },
    {
      input: {
        capacity: 1,
        operations: ["put", "get", "put", "get", "get"],
        values: [[2, 1], [2], [3, 2], [2], [3]]
      },
      expected: [null, 1, null, -1, 2]
    },
    {
      input: {
        capacity: 2,
        operations: ["get", "put", "get"],
        values: [[2], [2, 6], [2]]
      },
      expected: [-1, null, 6]
    }
  ]
};
