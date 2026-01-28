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
  testCases: [
    { expected: 9, input: { tokens: ['2', '1', '+', '3', '*'] } },
    { expected: 6, input: { tokens: ['4', '13', '5', '/', '+'] } },
    { expected: 22, input: { tokens: ['10', '6', '9', '3', '+', '-11', '*', '/', '*', '17', '+', '5', '+'] } },
    { expected: 7, input: { tokens: ['3', '4', '+'] } },
    { expected: 3, input: { tokens: ['5', '2', '-'] } }
  ]
};