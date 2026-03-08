const publicTests = [
  { expected: 5, input: { prices: [7, 1, 5, 3, 6, 4] } },
  { expected: 0, input: { prices: [7, 6, 4, 3, 1] } },
  { expected: 4, input: { prices: [1, 2, 3, 4, 5] } },
  { expected: 2, input: { prices: [2, 4, 1] } },
  { expected: 0, input: { prices: [3, 3, 3, 3] } }
];

const hiddenTests = [
  { expected: 0, input: { prices: [5] } },
  { expected: 6, input: { prices: [2, 4, 1, 7] } },
  { expected: 2, input: { prices: [2, 1, 2, 1, 0, 1, 2] } }
];

const performanceTests = [
  (() => {
    const prices = Array.from({ length: 20000 }, (_, index) => 20000 - index);
    prices.push(40000);
    return {
      input: { prices },
      expected: 39999
    };
  })()
];

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
  publicTests,
  hiddenTests,
  performanceTests,
  rubric: {
    weights: {
      correctness: 0.6,
      efficiency: 0.15,
      codeQuality: 0.15,
      communication: 0.1
    }
  },
  testCases: publicTests
};
