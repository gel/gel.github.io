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
    expected: [1, 2, 3, null, null, 4, 5],
    input: { root: [1, 2, 3, null, null, 4, 5] }
  },
  {
    expected: [],
    input: { root: [] }
  },
  {
    expected: [1],
    input: { root: [1] }
  },
  {
    expected: [5, 3, 8, 1, 4, null, 9],
    input: { root: [5, 3, 8, 1, 4, null, 9] }
  }
];

const hiddenTests = [
  {
    expected: [1, null, 2, null, 3],
    input: { root: [1, null, 2, null, 3] }
  },
  {
    expected: [-1, -2, -3, null, -4],
    input: { root: [-1, -2, -3, null, -4] }
  },
  {
    expected: [7, 3, 9, 1, 5, 8, 10],
    input: { root: [7, 3, 9, 1, 5, 8, 10] }
  }
];

const performanceTests = [
  (() => {
    const root = buildBalancedBstLevelOrder(1, 511);
    return {
      input: { root },
      expected: root
    };
  })()
];

window.problemConfig = {
  methodName: "roundTrip",
  typeMap: {
    root: "TreeNode"
  },
  starterCode: `from typing import List, Optional

class Codec:
    def serialize(self, root: Optional[TreeNode]) -> str:
        # TODO: Implement preorder serialization with null markers.
        values = []

        def dfs(node: Optional[TreeNode]) -> None:
            if node is None:
                values.append("N")
                return
            values.append(str(node.val))
            dfs(node.left)
            dfs(node.right)

        dfs(root)
        return ",".join(values)

    def deserialize(self, data: str) -> Optional[TreeNode]:
        # TODO: Implement inverse reconstruction from serialized string.
        tokens = iter(data.split(","))

        def build() -> Optional[TreeNode]:
            value = next(tokens)
            if value == "N":
                return None
            node = TreeNode(int(value))
            node.left = build()
            node.right = build()
            return node

        return build()

class Solution:
    def roundTrip(self, root: TreeNode) -> List[Optional[int]]:
        codec = Codec()
        serialized = codec.serialize(root)
        rebuilt = codec.deserialize(serialized)
        return self._to_level_order(rebuilt)

    def _to_level_order(self, root: Optional[TreeNode]) -> List[Optional[int]]:
        if root is None:
            return []

        result: List[Optional[int]] = []
        queue: List[Optional[TreeNode]] = [root]
        index = 0

        while index < len(queue):
            node = queue[index]
            index += 1
            if node is None:
                result.append(None)
                continue

            result.append(node.val)
            queue.append(node.left)
            queue.append(node.right)

        while result and result[-1] is None:
            result.pop()
        return result`,
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
