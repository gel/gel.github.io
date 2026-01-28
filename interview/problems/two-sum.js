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
  testCases: [
    { expected: [0, 1], input: { nums: [2, 7, 11, 15], target: 9 } },
    { expected: [1, 2], input: { nums: [3, 2, 4], target: 6 } },
    { expected: [0, 1], input: { nums: [3, 3], target: 6 } },
    { expected: [3, 4], input: { nums: [1, 2, 3, 4, 5], target: 9 } },
    { expected: [2, 4], input: { nums: [-1, -2, -3, -4, -5], target: -8 } }
  ]
};