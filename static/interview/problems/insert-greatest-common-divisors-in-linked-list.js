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