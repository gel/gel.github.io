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
window.problemConfig.publicTests = [...window.problemConfig.testCases];
window.problemConfig.hiddenTests = [
  {
    expected: 1,
    input: { root: [1], low: 1, high: 1 }
  },
  {
    expected: 23,
    input: { root: [5, 3, 8, 2, 4, 6, 9], low: 4, high: 8 }
  }
];
window.problemConfig.performanceTests = [
  {
    expected: 300500,
    input: {
      root: (() => {
        const values = Array.from({ length: 1023 }, (_, i) => i + 1);
        const build = (lo, hi) => {
          if (lo > hi) {
            return null;
          }
          const mid = Math.floor((lo + hi) / 2);
          return {
            val: values[mid],
            left: build(lo, mid - 1),
            right: build(mid + 1, hi)
          };
        };

        const root = build(0, values.length - 1);
        const out = [];
        const queue = [root];
        while (queue.length > 0) {
          const node = queue.shift();
          if (node === null) {
            out.push(null);
            continue;
          }
          out.push(node.val);
          queue.push(node.left);
          queue.push(node.right);
        }

        while (out.length > 0 && out[out.length - 1] === null) {
          out.pop();
        }
        return out;
      })(),
      low: 200,
      high: 800
    }
  }
];
window.problemConfig.rubric = {
  weights: {
    correctness: 0.6,
    edgeCases: 0.15,
    efficiency: 0.2,
    codeQuality: 0.05
  }
};
window.problemConfig.testCases = window.problemConfig.publicTests;
