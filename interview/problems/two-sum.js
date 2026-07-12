const publicTests = [
  { expected: [0, 1], input: { nums: [2, 7, 11, 15], target: 9 } },
  { expected: [1, 2], input: { nums: [3, 2, 4], target: 6 } },
  { expected: [0, 1], input: { nums: [3, 3], target: 6 } },
  { expected: [3, 4], input: { nums: [1, 2, 3, 4, 5], target: 9 } },
  { expected: [2, 4], input: { nums: [-1, -2, -3, -4, -5], target: -8 } }
];

const hiddenTests = [
  { expected: [0, 3], input: { nums: [0, 4, 3, 0], target: 0 } },
  { expected: [1, 3], input: { nums: [5, 75, 25, -25], target: 50 } },
  { expected: [2, 3], input: { nums: [10, -2, 8, 5], target: 13 } }
];

const performanceTests = [
  (() => {
    const nums = Array.from({ length: 10000 }, (_, index) => index + 1);
    return {
      input: { nums, target: 19999 },
      expected: [9998, 9999]
    };
  })()
];

window.problemConfig = {
  methodName: "twoSum",
  starterCode: `from typing import List

class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Brute force approach - check all pairs
        # TODO: Can you optimize this to O(n)?
        for i in range(len(nums)):
            for j in range(i + 1, len(nums)):
                if nums[i] + nums[j] == target:
                    return [i, j]
        return []`,
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
