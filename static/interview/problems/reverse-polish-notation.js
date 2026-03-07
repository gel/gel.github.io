const publicTests = [
  { expected: 9, input: { tokens: ["2", "1", "+", "3", "*"] } },
  { expected: 6, input: { tokens: ["4", "13", "5", "/", "+"] } },
  { expected: 22, input: { tokens: ["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"] } },
  { expected: 7, input: { tokens: ["3", "4", "+"] } },
  { expected: 3, input: { tokens: ["5", "2", "-"] } }
];

const hiddenTests = [
  { expected: -2, input: { tokens: ["-4", "2", "/"] } },
  { expected: 14, input: { tokens: ["5", "1", "2", "+", "4", "*", "+", "3", "-"] } },
  { expected: 0, input: { tokens: ["2", "3", "/"] } }
];

const performanceTests = [
  (() => {
    const tokens = ["1", "1", "+"];
    for (let index = 2; index < 2000; index += 1) {
      tokens.push("1", "+");
    }
    return {
      input: { tokens },
      expected: 2000
    };
  })()
];

window.problemConfig = {
  methodName: "evalRPN",
  starterCode: `from typing import List

class Solution:
    def evalRPN(self, tokens: List[str]) -> int:
        # Use a stack to evaluate the expression
        stack = []

        for token in tokens:
            if token in ['+', '-', '*', '/']:
                # Pop two operands
                right = stack.pop()
                left = stack.pop()

                # Perform operation
                if token == '+':
                    result = left + right
                elif token == '-':
                    result = left - right
                elif token == '*':
                    result = left * right
                elif token == '/':
                    # Truncate toward zero
                    result = int(left / right)

                stack.append(result)
            else:
                stack.append(int(token))

        return stack[0]`,
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

window.problemConfig.publicTests = [...window.problemConfig.testCases];
window.problemConfig.hiddenTests = [
  { expected: 6, input: { tokens: ["18", "3", "/"] } },
  { expected: -2, input: { tokens: ["7", "-3", "/"] } }
];
window.problemConfig.performanceTests = [
  {
    expected: 2000,
    input: {
      tokens: (() => {
        const n = 2000;
        const tokens = ["1", "1", "+"];
        for (let i = 2; i < n; i += 1) {
          tokens.push("1", "+");
        }
        return tokens;
      })()
    }
  }
];
window.problemConfig.rubric = {
  weights: {
    correctness: 0.65,
    edgeCases: 0.15,
    efficiency: 0.15,
    codeQuality: 0.05
  }
};
window.problemConfig.testCases = window.problemConfig.publicTests;
