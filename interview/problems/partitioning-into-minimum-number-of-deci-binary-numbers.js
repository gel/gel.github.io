window.problemConfig = {
  methodName: "minPartitions",
  starterCode: `class Solution:
    def minPartitions(self, n: str) -> int:
        # TODO: Return the minimum number of deci-binary numbers
        pass`,
  testCases: [
    { expected: 3, input: { n: "32" } },
    { expected: 8, input: { n: "82734" } },
    { expected: 9, input: { n: "27346209830709182346" } }
  ]
};