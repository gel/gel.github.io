const publicTests = [
  {
    input: {
      root: {
        name: "root",
        is_file: false,
        size: 0,
        children: [
          { name: "a.xml", is_file: true, size: 7000000, children: [] },
          { name: "b.txt", is_file: true, size: 8000000, children: [] },
          {
            name: "data",
            is_file: false,
            size: 0,
            children: [
              { name: "c.xml", is_file: true, size: 3000000, children: [] },
              { name: "d.xml", is_file: true, size: 9000000, children: [] }
            ]
          }
        ]
      },
      min_size: 5000000,
      extension: "xml"
    },
    expected: ["root/a.xml", "root/data/d.xml"]
  },
  {
    input: {
      root: {
        name: "root",
        is_file: false,
        size: 0,
        children: [
          { name: "a.xml", is_file: true, size: 7000000, children: [] },
          { name: "b.txt", is_file: true, size: 8000000, children: [] },
          { name: "c.xml", is_file: true, size: 3000000, children: [] }
        ]
      },
      min_size: null,
      extension: "xml"
    },
    expected: ["root/a.xml", "root/c.xml"]
  },
  {
    input: {
      root: {
        name: "root",
        is_file: false,
        size: 0,
        children: [
          { name: "a.xml", is_file: true, size: 7000000, children: [] },
          { name: "b.txt", is_file: true, size: 8000000, children: [] },
          { name: "c.log", is_file: true, size: 2000000, children: [] }
        ]
      },
      min_size: 7500000,
      extension: null
    },
    expected: ["root/b.txt"]
  },
  {
    input: {
      root: {
        name: "root",
        is_file: false,
        size: 0,
        children: []
      },
      min_size: 1,
      extension: "xml"
    },
    expected: []
  }
];

const hiddenTests = [
  {
    input: {
      root: {
        name: "root",
        is_file: false,
        size: 0,
        children: [
          { name: "README.MD", is_file: true, size: 50, children: [] },
          { name: "notes.md", is_file: true, size: 25, children: [] }
        ]
      },
      min_size: null,
      extension: "md"
    },
    expected: ["root/README.MD", "root/notes.md"]
  },
  {
    input: {
      root: {
        name: "root",
        is_file: false,
        size: 0,
        children: [
          {
            name: "src",
            is_file: false,
            size: 0,
            children: [
              { name: "app.py", is_file: true, size: 20, children: [] },
              { name: "lib.py", is_file: true, size: 200, children: [] }
            ]
          },
          { name: "build", is_file: false, size: 0, children: [] }
        ]
      },
      min_size: 100,
      extension: "py"
    },
    expected: ["root/src/lib.py"]
  },
  {
    input: {
      root: {
        name: "root",
        is_file: false,
        size: 0,
        children: [
          { name: "alpha.txt", is_file: true, size: 1, children: [] },
          {
            name: "nested",
            is_file: false,
            size: 0,
            children: [
              { name: "beta.log", is_file: true, size: 2, children: [] }
            ]
          }
        ]
      },
      min_size: null,
      extension: null
    },
    expected: ["root/alpha.txt", "root/nested/beta.log"]
  }
];

const performanceTests = [
  (() => {
    const expected = [];
    const children = [];

    for (let dirIndex = 0; dirIndex < 200; dirIndex += 1) {
      const dirChildren = [];
      for (let fileIndex = 0; fileIndex < 10; fileIndex += 1) {
        const isXml = fileIndex % 2 === 0;
        const name = `file-${dirIndex}-${fileIndex}.${isXml ? "xml" : "txt"}`;
        const size = isXml ? 10000 + fileIndex : 5000 + fileIndex;
        dirChildren.push({ name, is_file: true, size, children: [] });
        if (isXml) {
          expected.push(`root/dir-${dirIndex}/${name}`);
        }
      }
      children.push({
        name: `dir-${dirIndex}`,
        is_file: false,
        size: 0,
        children: dirChildren
      });
    }

    return {
      input: {
        root: {
          name: "root",
          is_file: false,
          size: 0,
          children
        },
        min_size: 10000,
        extension: "xml"
      },
      expected
    };
  })()
];

window.problemConfig = {
  methodName: "findMatchingPaths",
  starterCode: `from typing import Any, Dict, List, Optional

class Matcher:
    def matches(self, node: Dict[str, Any]) -> bool:
        raise NotImplementedError

class IsFileMatcher(Matcher):
    def matches(self, node: Dict[str, Any]) -> bool:
        return bool(node.get("is_file"))

class SizeAtLeastMatcher(Matcher):
    def __init__(self, min_size: int):
        self.min_size = min_size

    def matches(self, node: Dict[str, Any]) -> bool:
        return int(node.get("size", 0)) >= self.min_size

class ExtensionMatcher(Matcher):
    def __init__(self, extension: str):
        ext = extension.lower().strip()
        self.suffix = "." + ext if ext else ""

    def matches(self, node: Dict[str, Any]) -> bool:
        name = str(node.get("name", "")).lower()
        return name.endswith(self.suffix)

class AndMatcher(Matcher):
    def __init__(self, matchers: List[Matcher]):
        self.matchers = matchers

    def matches(self, node: Dict[str, Any]) -> bool:
        for matcher in self.matchers:
            if not matcher.matches(node):
                return False
        return True

class Solution:
    def findMatchingPaths(
        self,
        root: Dict[str, Any],
        min_size: Optional[int],
        extension: Optional[str]
    ) -> List[str]:
        matchers: List[Matcher] = [IsFileMatcher()]

        if min_size is not None:
            matchers.append(SizeAtLeastMatcher(min_size))
        if extension is not None:
            matchers.append(ExtensionMatcher(extension))

        matcher = AndMatcher(matchers)
        result: List[str] = []

        def dfs(node: Dict[str, Any], path: str) -> None:
            name = str(node.get("name", ""))
            current = f"{path}/{name}" if path else name

            if matcher.matches(node):
                result.append(current)

            if not node.get("is_file", False):
                for child in node.get("children", []):
                    dfs(child, current)

        dfs(root, "")
        result.sort()
        return result`,
  publicTests,
  hiddenTests,
  performanceTests,
  rubric: {
    weights: {
      correctness: 0.4,
      efficiency: 0.15,
      codeQuality: 0.35,
      communication: 0.1
    }
  },
  testCases: publicTests
};
