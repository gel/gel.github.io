+++
title = "Logical and Maintainable"
weight = 1
+++

### Evaluate Reverse Polish Notation - [LC 150](https://leetcode.com/problems/evaluate-reverse-polish-notation)

**Question**

> Evaluate the value of an arithmetic expression in > Reverse Polish Notation.
> 
> Valid operators are +, -, *, and /. Each operand may > be an integer or another expression.
> 
> Note that division between two integers should > truncate toward zero.
> 
> It is guaranteed that the given RPN expression is > always valid. That means the expression would always > evaluate to a result, and there will not be any > division by zero operation.

**Explanation**

To perform operation in polish notation we need a stack data-structure (first in last out). We will read the tokens until we encounter operation and then perform the calculation.

**Solution**

```java
class ReversePolishNotation {
    private static boolean isNumeric(String token) {
      try {  
        Double.parseDouble(token);  
        return true;
      } catch(NumberFormatException e) {  
        return false;  
      }
    }
    
    private static int performCalculation(int left, int right, String operand) {
        if (operand.equals("+")) {
            return left + right;
        } else if (operand.equals("-")) {
            return left - right;
        } else if (operand.equals("*")) {
            return left * right;
        } else if (operand.equals("/")) {
            return left / right;
        } else {
            System.out.println("left: " + left + " right: " + right + " operand: " + operand);
            throw new RuntimeException("Unexpected operand");
        }
    }
    
    public int evalRPN(String[] tokens) {
        Stack<Integer> numbers = new Stack<Integer>();
        for (int i = 0; i < tokens.length; i++) {
            String token = tokens[i];
            if (!isNumeric(token)) {
                int right = numbers.pop();
                int left = numbers.pop();
                int result = performCalculation(left, right, token);
                numbers.add(result);
            } else {
                numbers.add(Integer.parseInt(token));
            }
        }
        return numbers.pop();
    }
}
```