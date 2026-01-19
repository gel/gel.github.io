window.problemConfig = {
  methodName: "rangeSumBST",
  typeMap: {
    root: "TreeNode"
  },
  starterCode: `# Definition for a binary tree node.
# class TreeNode:
#     def __init__(self, val=0, left=None, right=None):
#         self.val = val
#         self.left = left
#         self.right = right
class Solution:
    def rangeSumBST(self, root: TreeNode, low: int, high: int) -> int:
        # TODO: Implement recursive or iterative solution
        pass`,
  testCases: [
    {
      expected: 32,
      input: { root: [10, 5, 15, 3, 7, null, 18], low: 7, high: 15 }
    },
    {
      expected: 23,
      input: { root: [10, 5, 15, 3, 7, 13, 18, 1, null, 6], low: 6, high: 10 }
    }
  ]
};