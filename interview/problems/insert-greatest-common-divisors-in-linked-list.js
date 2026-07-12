const publicTests = [
  { expected: [18, 6, 6, 2, 10, 1, 3], input: { head: [18, 6, 10, 3] } },
  { expected: [7], input: { head: [7] } }
];

const hiddenTests = [
  { expected: [5, 5, 10, 5, 15], input: { head: [5, 10, 15] } },
  { expected: [2, 2, 2], input: { head: [2, 2] } },
  { expected: [8, 4, 12, 6, 18], input: { head: [8, 12, 18] } }
];

const performanceTests = [
  (() => {
    const head = Array(400).fill(12);
    const expected = [];
    for (let index = 0; index < head.length; index += 1) {
      expected.push(12);
      if (index < head.length - 1) {
        expected.push(12);
      }
    }
    return {
      input: { head },
      expected
    };
  })()
];

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
  publicTests,
  hiddenTests,
  performanceTests,
  rubric: {
    weights: {
      correctness: 0.5,
      efficiency: 0.2,
      codeQuality: 0.2,
      communication: 0.1
    }
  },
  testCases: publicTests
};
