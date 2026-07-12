const publicTests = [
  { expected: "geeksskeeg", input: { s: "forgeeksskeegfor" } },
  { expected: "bb", input: { s: "cbbd" } },
  { expected: "a", input: { s: "a" } },
  { expected: "a", input: { s: "ac" } },
  { expected: "anana", input: { s: "anana" } }
];

const hiddenTests = [
  { expected: "anana", input: { s: "bananas" } },
  { expected: "abba", input: { s: "abba" } },
  { expected: "a", input: { s: "abcda" } }
];

const performanceTests = [
  (() => {
    const s = "z".repeat(900);
    return {
      input: { s },
      expected: s
    };
  })()
];

window.problemConfig = {
  methodName: "longestPalindrome",
  starterCode: `class Solution:
    def longestPalindrome(self, s: str) -> str:
        # Brute force - check all substrings
        # TODO: Can you optimize this?
        def is_palindrome(sub):
            return sub == sub[::-1]

        longest = ""
        for i in range(len(s)):
            for j in range(i + 1, len(s) + 1):
                substring = s[i:j]
                if is_palindrome(substring) and len(substring) > len(longest):
                    longest = substring
        return longest`,
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
