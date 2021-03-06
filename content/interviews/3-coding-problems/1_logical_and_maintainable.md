+++
title = "Logical and Maintainable"
weight = 1
+++

- [Range Sum of BST - Easy - LeetCode 938](#range-sum-of-bst-easy-leetcode-938)
- [Evaluate Reverse Polish Notation - Easy - LeetCode 150](#evaluate-reverse-polish-notation-easy-leetcode-150)
- [Two Sum - Easy - LeetCode 1](#two-sum-easy-leetcode-1)
- [Best Time to Buy and Sell Stock - Easy - LeetCode 121](#best-time-to-buy-and-sell-stock-easy-leetcode-121)
--- 

### Range Sum of BST - Easy - [LeetCode 938](https://leetcode.com/problems/range-sum-of-bst/)

> Given the root node of a binary search tree and two integers low and high, return the sum of values of all nodes with a value in the inclusive range [low, high].

**Explanation**

Traversal of the tree in any order is fine and make sure you don't traverse the unnecessary parts of the tree. Recrusion or iterative solution are acceptable (make sure you can explain that any recursive solution can be converted to an iterative solution).

**Solution**

```java
class RangeSumBST {
    public int rangeSumBST(TreeNode root, int low, int high) {
        Queue<TreeNode> queue = new LinkedList<TreeNode>();
        queue.add(root);
        
        int sum = 0;
        while (!queue.isEmpty()) {
            TreeNode node = queue.poll();
            if (node.val >= low && node.val <= high)
                sum += node.val;
            
            if (node.left != null && node.val >= low)
                queue.add(node.left);
            
            if (node.right != null && node.val <= high)
                queue.add(node.right);
        }
        return sum;
    }
}
```

---

### Evaluate Reverse Polish Notation - Easy - [LeetCode 150](https://leetcode.com/problems/evaluate-reverse-polish-notation/)

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

---

### Two Sum - Easy - [LeetCode 1](https://leetcode.com/problems/two-sum/)

**Question**

> Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

**Explanation**

In this question we need to find elem + X = target => X = target - elem;

A common solution is to create a map from number to index (one pass).
Then leverage it during traversal to check if the element exist (second pass).

Since this problem is a sum of two elements we can do it in a single pass (the second element will have the first one in the data-structre).


**Solution**

```java
public class TwoSum {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> numberToIndex = new HashMap<>();
        int[] result = new int[2]; // number, index
        for (int i = 0; i < nums.length; i++) {
            int needed = target - nums[i];
            if (numberToIndex.containsKey(needed)) {
                Integer index = numberToIndex.get(needed);
                result[0] = i;
                result[1] = index;
                return result;
            }

            numberToIndex.put(nums[i], i);
        }

        throw new IllegalArgumentException("Invalid input");
    }
```

---

### Best Time to Buy and Sell Stock- Easy - [LeetCode 121](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/)

**Question**

> You are given an array prices where prices[i] is the price of a given stock on the ith day.

> You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

> Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.

**Explanation**

We are looking for the largest difference (min / max). Therefore we need to do a simple book keeping and keep track of the current minimum and profit we have. While we traverse the array we update the min if necessary and record the profit if it's bigger than what we have. I wrote my initial solution but there is no need to keep track of the current profit (we can just record max profit when needed).

**Solution**


```java
class BestTimeToSellStock {
    public int maxProfit(int[] prices) {
        int size = prices.length;
        if (size <= 1)
            return 0;
        
        int currentMin = prices[0];
        int currentProfit = 0;
        int maxProfit = 0;
        
        for (int i = 1; i < size; i++) {
            if (prices[i] < currentMin) {
                maxProfit = Math.max(maxProfit, currentProfit);
                currentProfit = 0;
                currentMin = prices[i];
            } else {
                int candidateProfit = prices[i] - currentMin;
                currentProfit = Math.max(candidateProfit, currentProfit);
            }
        }
        maxProfit = Math.max(maxProfit, currentProfit);
        
        return maxProfit;
    }
}
```