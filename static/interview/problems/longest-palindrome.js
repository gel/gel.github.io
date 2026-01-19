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
  testCases: [
    { expected: "bab", input: { s: "babad" } },
    { expected: "bb", input: { s: "cbbd" } },
    { expected: "a", input: { s: "a" } },
    { expected: "a", input: { s: "ac" } },
    { expected: "racecar", input: { s: "racecar" } }
  ]
};