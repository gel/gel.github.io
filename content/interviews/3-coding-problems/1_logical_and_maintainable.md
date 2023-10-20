+++
title = "Logical and Maintainable"
weight = 1
+++

- [Range Sum of BST - Easy - LeetCode 938](#range-sum-of-bst-easy-leetcode-938)
- [Evaluate Reverse Polish Notation - Easy - LeetCode 150](#evaluate-reverse-polish-notation-easy-leetcode-150)
- [Two Sum - Easy - LeetCode 1](#two-sum-easy-leetcode-1)
- [Best Time to Buy and Sell Stock - Easy - LeetCode 121](#best-time-to-buy-and-sell-stock-easy-leetcode-121)
- [Partitioning Into Minimum Number Of Deci-Binary Numbers - Medium - LeetCode 1689](#partitioning-into-minimum-number-of-deci-binary-numbers-medium-leetcode-1689)
- [Insert Greatest Common Divisors in Linked List - Medium - LeetCode 2807](#insert-greatest-common-divisors-in-linked-list-medium-leetcode-2807)

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

### Best Time to Buy and Sell Stock - Easy - [LeetCode 121](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/)

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

### Partitioning Into Minimum Number Of Deci-Binary Numbers - Medium - [LeetCode 1689](https://leetcode.com/problems/partitioning-into-minimum-number-of-deci-binary-numbers/)

**Question**

A decimal number is called deci-binary if each of its digits is either 0 or 1 without any leading zeros. For example, 101 and 1100 are deci-binary, while 112 and 3001 are not.

Given a string n that represents a positive decimal integer, return the minimum number of positive deci-binary numbers needed so that they sum up to n.

Example 1:

Input: n = "32"
Output: 3
Explanation: 10 + 11 + 11 = 32
Example 2:

Input: n = "82734"
Output: 8
Example 3:

Input: n = "27346209830709182346"
Output: 9
 
Constraints:

1 <= n.length <= 105
n consists of only digits.
n does not contain any leading zeros and represents a positive integer.


**Explanation**

This question relies on logic, since we can use only deci-binary numbers (zero or 1 in each digit) it means that in order to build a specific digit k we will need at-least k different deci numbers. Therefore, the answer is the maximum of all digits in n ```max(k)```

**Solution**


```java
class MinPartitionsSolutions {
    public int minPartitions(String n) {
        int max = 0;
        for(int i = 0; i < n.length(); i++){
            int digit = n.charAt(i) - '0';
            if (digit > max) {
                max = digit;
            }
        }
        return max;
    }
}
```

### Insert Greatest Common Divisors in Linked List - Medium - [LeetCode 2807](https://leetcode.com/problems/insert-greatest-common-divisors-in-linked-list/)

**Question**

Given the head of a linked list head, in which each node contains an integer value.

Between every pair of adjacent nodes, insert a new node with a value equal to the greatest common divisor of them.

Return the linked list after insertion.

The greatest common divisor of two numbers is the largest positive integer that evenly divides both numbers.

 

Example 1:


Input: head = [18,6,10,3]
Output: [18,6,6,2,10,1,3]
Explanation: The 1st diagram denotes the initial linked list and the 2nd diagram denotes the linked list after inserting the new nodes (nodes in blue are the inserted nodes).
- We insert the greatest common divisor of 18 and 6 = 6 between the 1st and the 2nd nodes.
- We insert the greatest common divisor of 6 and 10 = 2 between the 2nd and the 3rd nodes.
- We insert the greatest common divisor of 10 and 3 = 1 between the 3rd and the 4th nodes.
There are no more adjacent nodes, so we return the linked list.
Example 2:


Input: head = [7]
Output: [7]
Explanation: The 1st diagram denotes the initial linked list and the 2nd diagram denotes the linked list after inserting the new nodes.
There are no pairs of adjacent nodes, so we return the initial linked list.
 

Constraints:

The number of nodes in the list is in the range [1, 5000].
1 <= Node.val <= 1000

**Explanation**

The idea is to break the solution into two different parts.

1. Implement GCD. The recursive way is the easiest, a side note is that it's usually not recommended to implement recursion but in this case because it is tail recursion the compiler or JVM would be able to optimize it if needed.

2. Add a new node from the GCD value.

**Solution**

```java
/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */
class GreatestCommonDivisorsSolution {
    public ListNode insertGreatestCommonDivisors(ListNode head) {
        ListNode curr = head;
        while (curr != null && curr.next != null) {
            int newVal = gcd(curr.val, curr.next.val);
            // insert new node between curr and curr.next with newVal
            curr.next = new ListNode(newVal, curr.next);
            curr = curr.next.next;
        }
        return head;
    }

    private int gcd(int a, int b) {
        if (b == 0) return a;
        return gcd(b, a % b);
    }
}
```