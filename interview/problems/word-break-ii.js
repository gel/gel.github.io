const publicTests = [
  {
    input: {
      s: "catsanddog",
      wordDict: ["cat", "cats", "and", "sand", "dog"]
    },
    expected: ["cat sand dog", "cats and dog"]
  },
  {
    input: {
      s: "pineapplepenapple",
      wordDict: ["apple", "pen", "applepen", "pine", "pineapple"]
    },
    expected: [
      "pine apple pen apple",
      "pine applepen apple",
      "pineapple pen apple"
    ]
  },
  {
    input: {
      s: "catsandog",
      wordDict: ["cats", "dog", "sand", "and", "cat"]
    },
    expected: []
  }
];

const hiddenTests = [
  {
    input: {
      s: "aaaa",
      wordDict: ["a", "aa"]
    },
    expected: ["a a a a", "a a aa", "a aa a", "aa a a", "aa aa"]
  },
  {
    input: {
      s: "leetcode",
      wordDict: ["leet", "code", "le", "etc"]
    },
    expected: ["leet code"]
  },
  {
    input: {
      s: "cars",
      wordDict: ["car", "ca", "rs"]
    },
    expected: ["ca rs"]
  }
];

const performanceTests = [
  {
    input: {
      s: "a".repeat(18) + "b",
      wordDict: ["a", "aa", "aaa", "aaaa", "aaaaa", "aaaaaa"]
    },
    expected: []
  }
];

window.problemConfig = {
  methodName: "wordBreak",
  starterCode: `from typing import List, Dict

class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> List[str]:
        words = set(wordDict)
        memo: Dict[int, List[str]] = {}

        def dfs(start: int) -> List[str]:
            if start in memo:
                return memo[start]
            if start == len(s):
                return [""]

            result: List[str] = []
            for end in range(start + 1, len(s) + 1):
                candidate = s[start:end]
                if candidate not in words:
                    continue
                suffixes = dfs(end)
                for suffix in suffixes:
                    if suffix:
                        result.append(candidate + " " + suffix)
                    else:
                        result.append(candidate)

            memo[start] = result
            return result

        answer = dfs(0)
        answer.sort()
        return answer`,
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
