const publicTests = [
  { expected: "wertf", input: { words: ["wrt", "wrf", "er", "ett", "rftt"] } },
  { expected: "zx", input: { words: ["z", "x"] } },
  { expected: "", input: { words: ["z", "x", "z"] } },
  { expected: "", input: { words: ["abc", "ab"] } }
];

const hiddenTests = [
  { expected: "bdac", input: { words: ["baa", "abcd", "abca", "cab", "cad"] } },
  { expected: "cab", input: { words: ["caa", "aaa", "aab"] } },
  { expected: "azbc", input: { words: ["za", "zb", "ca", "cb"] } }
];

const performanceTests = [
  (() => {
    const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
    return {
      input: { words: alphabet.map((ch) => `${ch}${"x".repeat(50)}`) },
      expected: alphabet.join("")
    };
  })()
];

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
  publicTests,
  hiddenTests,
  performanceTests,
  rubric: {
    weights: {
      correctness: 0.45,
      efficiency: 0.25,
      codeQuality: 0.2,
      communication: 0.1
    }
  },
  testCases: publicTests
};
