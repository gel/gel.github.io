window.problemConfig = {
  methodName: "maxProfit",
  starterCode: `from typing import List

class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        # Brute force - check all buy/sell combinations
        # TODO: Can you optimize this to O(n)?
        max_profit = 0
        for i in range(len(prices)):
            for j in range(i + 1, len(prices)):
                profit = prices[j] - prices[i]
                if profit > max_profit:
                    max_profit = profit
        return max_profit`,
  testCases: [
    { expected: 5, input: { prices: [7, 1, 5, 3, 6, 4] } },
    { expected: 0, input: { prices: [7, 6, 4, 3, 1] } },
    { expected: 4, input: { prices: [1, 2, 3, 4, 5] } },
    { expected: 2, input: { prices: [2, 4, 1] } },
    { expected: 0, input: { prices: [3, 3, 3, 3] } }
  ]
};