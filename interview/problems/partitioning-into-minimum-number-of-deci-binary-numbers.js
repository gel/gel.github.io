const publicTests = [
  { expected: 3, input: { n: "32" } },
  { expected: 8, input: { n: "82734" } },
  { expected: 9, input: { n: "27346209830709182346" } }
];

const hiddenTests = [
  { expected: 1, input: { n: "1" } },
  { expected: 1, input: { n: "11111" } },
  { expected: 9, input: { n: "909" } }
];

const performanceTests = [
  {
    input: { n: "1234567890".repeat(1000) },
    expected: 9
  }
];

window.problemConfig = {
  methodName: "minPartitions",
  starterCode: `class Solution:
    def minPartitions(self, n: str) -> int:
        # TODO: Return the minimum number of deci-binary numbers
        pass`,
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
