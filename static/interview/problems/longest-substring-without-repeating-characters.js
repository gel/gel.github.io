const publicTests = [
  { expected: 3, input: { s: "abcabcbb" } },
  { expected: 1, input: { s: "bbbbb" } },
  { expected: 3, input: { s: "pwwkew" } },
  { expected: 0, input: { s: "" } },
  { expected: 3, input: { s: "dvdf" } }
];

const hiddenTests = [
  { expected: 2, input: { s: "abba" } },
  { expected: 1, input: { s: " " } },
  { expected: 5, input: { s: "tmmzuxt" } }
];

const performanceTests = [
  {
    input: { s: "abcdefghijklmnopqrstuvwxyz".repeat(2000) },
    expected: 26
  }
];

window.problemConfig = {
  methodName: "lengthOfLongestSubstring",
  starterCode: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        # Sliding window target: O(n)
        # TODO: implement the optimal approach
        left = 0
        best = 0
        last_seen = {}

        for right, ch in enumerate(s):
            if ch in last_seen and last_seen[ch] >= left:
                left = last_seen[ch] + 1
            last_seen[ch] = right
            best = max(best, right - left + 1)

        return best`,
  publicTests,
  hiddenTests,
  performanceTests,
  rubric: {
    weights: {
      correctness: 0.5,
      efficiency: 0.2,
      codeQuality: 0.2,
      communication: 0.1
    }
  },
  testCases: publicTests
};
