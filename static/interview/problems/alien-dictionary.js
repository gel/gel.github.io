window.problemConfig = {
  methodName: "alienOrder",
  starterCode: `from typing import List, Dict, Set
from collections import deque

class Solution:
    def alienOrder(self, words: List[str]) -> str:
        graph: Dict[str, Set[str]] = {}
        indegree: Dict[str, int] = {}

        for word in words:
            for ch in word:
                if ch not in graph:
                    graph[ch] = set()
                if ch not in indegree:
                    indegree[ch] = 0

        for i in range(len(words) - 1):
            first = words[i]
            second = words[i + 1]

            if len(first) > len(second) and first.startswith(second):
                return ""

            for j in range(min(len(first), len(second))):
                left = first[j]
                right = second[j]
                if left != right:
                    if right not in graph[left]:
                        graph[left].add(right)
                        indegree[right] += 1
                    break

        queue = deque([ch for ch in indegree if indegree[ch] == 0])
        order = []

        while queue:
            ch = queue.popleft()
            order.append(ch)
            for nxt in graph[ch]:
                indegree[nxt] -= 1
                if indegree[nxt] == 0:
                    queue.append(nxt)

        if len(order) != len(indegree):
            return ""

        return "".join(order)`,
  testCases: [
    { expected: "wertf", input: { words: ["wrt", "wrf", "er", "ett", "rftt"] } },
    { expected: "zx", input: { words: ["z", "x"] } },
    { expected: "", input: { words: ["z", "x", "z"] } },
    { expected: "", input: { words: ["abc", "ab"] } }
  ]
};

window.problemConfig.publicTests = [...window.problemConfig.testCases];
window.problemConfig.hiddenTests = [
  { expected: "wxyz", input: { words: ["w", "x", "y", "z"] } },
  { expected: "", input: { words: ["a", "b", "a"] } }
];
window.problemConfig.performanceTests = [
  {
    expected: "abc",
    input: {
      words: Array.from({ length: 2000 }, () => "abc")
    }
  }
];
window.problemConfig.rubric = {
  weights: {
    correctness: 0.55,
    edgeCases: 0.2,
    efficiency: 0.2,
    codeQuality: 0.05
  }
};
window.problemConfig.testCases = window.problemConfig.publicTests;
