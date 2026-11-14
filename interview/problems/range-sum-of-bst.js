function buildBalancedBstLevelOrder(start, end) {
  function build(low, high) {
    if (low > high) {
      return null;
    }

    const mid = Math.floor((low + high) / 2);
    return {
      val: mid,
      left: build(low, mid - 1),
      right: build(mid + 1, high)
    };
  }

  const root = build(start, end);
  const result = [];
  const queue = [root];

  while (queue.length > 0) {
    const node = queue.shift();
    if (node === null) {
      result.push(null);
      continue;
    }

    result.push(node.val);
    if (node.left !== null || node.right !== null) {
      queue.push(node.left);
      queue.push(node.right);
    }
  }

  while (result.length > 0 && result[result.length - 1] === null) {
    result.pop();
  }

  return result;
}

const publicTests = [
  {
    expected: 32,
    input: { root: [10, 5, 15, 3, 7, null, 18], low: 7, high: 15 }
  },
  {
    expected: 23,
    input: { root: [10, 5, 15, 3, 7, 13, 18, 1, null, 6], low: 6, high: 10 }
  }
];

const hiddenTests = [
  {
    expected: 10,
    input: { root: [10], low: 6, high: 10 }
  },
  {
    expected: 42,
    input: { root: [18, 9, 27, 6, 15, 24, 30], low: 16, high: 26 }
  },
  {
    expected: 18,
    input: { root: [8, 3, 10, 1, 6, null, 14, null, null, 4, 7, 13], low: 6, high: 8 }
  }
];

const performanceTests = [
  {
    input: { root: buildBalancedBstLevelOrder(1, 1023), low: 100, high: 900 },
    expected: 400500
  }
];

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
