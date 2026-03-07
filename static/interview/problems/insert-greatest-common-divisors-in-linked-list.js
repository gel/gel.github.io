window.problemConfig = {
  methodName: "insertGreatestCommonDivisors",
  typeMap: {
    head: "ListNode",
    return: "ListNode"
  },
  starterCode: `# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
import math

class Solution:
    def insertGreatestCommonDivisors(self, head: ListNode) -> ListNode:
        # TODO: Traverse list and insert GCD nodes
        pass`,
  testCases: [
    { expected: [18, 6, 6, 2, 10, 1, 3], input: { head: [18, 6, 10, 3] } },
    { expected: [7], input: { head: [7] } }
  ]
};
window.problemConfig.publicTests = [...window.problemConfig.testCases];
window.problemConfig.hiddenTests = [
  { expected: [2, 2, 4, 2, 6], input: { head: [2, 4, 6] } },
  { expected: [5, 5, 10, 5, 15], input: { head: [5, 10, 15] } }
];
window.problemConfig.performanceTests = [
  {
    expected: Array.from({ length: 3999 }, () => 12),
    input: { head: Array.from({ length: 2000 }, () => 12) }
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
