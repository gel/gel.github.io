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
  testCases: [
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
  ]
};

window.problemConfig.publicTests = [...window.problemConfig.testCases];
window.problemConfig.hiddenTests = [
  {
    expected: [1, null, 2, 3],
    input: { root: [1, null, 2, 3] }
  },
  {
    expected: [2, 1, 3, null, null, 4],
    input: { root: [2, 1, 3, null, null, 4] }
  }
];
window.problemConfig.performanceTests = [
  {
    expected: Array.from({ length: 511 }, (_, i) => i + 1),
    input: { root: Array.from({ length: 511 }, (_, i) => i + 1) }
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
