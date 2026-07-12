const publicTests = [
  { expected: [1.0, 1.5, 2.0, 2.5], input: { nums: [1, 2, 3, 4] } },
  { expected: [5.0, 10.0, 5.0, 4.0], input: { nums: [5, 15, 1, 3] } },
  { expected: [2.0, 0.5, -1.0, 0.5], input: { nums: [2, -1, -1, 2] } },
  { expected: [], input: { nums: [] } }
];

const hiddenTests = [
  { expected: [2.0, 1.5, 2.0, 2.5, 3.0], input: { nums: [2, 1, 3, 4, 5] } },
  { expected: [7.0, 7.0, 7.0], input: { nums: [7, 7, 7] } },
  { expected: [10.0, 5.5, 6.0, 5.5], input: { nums: [10, 1, 8, 5] } }
];

const performanceTests = [
  (() => {
    const nums = Array.from({ length: 2000 }, (_, index) => index + 1);
    const expected = nums.map((_, index) => {
      const count = index + 1;
      return count % 2 === 1 ? (count + 1) / 2 : count / 2 + 0.5;
    });
    return {
      input: { nums },
      expected
    };
  })()
];

window.problemConfig = {
  methodName: "runningMedian",
  starterCode: `from typing import List
import heapq

class Solution:
    def runningMedian(self, nums: List[int]) -> List[float]:
        # low = max-heap (store negatives), high = min-heap
        low = []
        high = []
        medians: List[float] = []

        for num in nums:
            heapq.heappush(low, -num)
            heapq.heappush(high, -heapq.heappop(low))

            if len(high) > len(low):
                heapq.heappush(low, -heapq.heappop(high))

            if len(low) > len(high):
                medians.append(float(-low[0]))
            else:
                medians.append((-low[0] + high[0]) / 2.0)

        return medians`,
  publicTests,
  hiddenTests,
  performanceTests,
  rubric: {
    weights: {
      correctness: 0.45,
      efficiency: 0.25,
      codeQuality: 0.2,
      communication: 0.1
    }
  },
  testCases: publicTests
};
