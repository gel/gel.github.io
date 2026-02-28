// Pyodide Web Worker - Isolated from Monaco's AMD loader
// This runs in a separate JavaScript context

let pyodide = null;

// Initialize Pyodide
async function initPyodide() {
  if (pyodide) return pyodide;

  // Import Pyodide in the worker context
  importScripts('https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js');

  pyodide = await loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
  });

  return pyodide;
}

// Python wrapper for running tests
const pythonWrapper = `
import json

# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

# Definition for a binary tree node.
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def create_linked_list(arr):
    if not arr: return None
    head = ListNode(arr[0])
    curr = head
    for val in arr[1:]:
        curr.next = ListNode(val)
        curr = curr.next
    return head

def linked_list_to_list(head):
    arr = []
    curr = head
    while curr:
        arr.append(curr.val)
        curr = curr.next
    return arr

def list_to_tree(arr):
    if not arr: return None
    if arr[0] is None: return None
    
    root = TreeNode(arr[0])
    queue = [root]
    i = 1
    while queue and i < len(arr):
        node = queue.pop(0)
        
        # Left child
        if i < len(arr) and arr[i] is not None:
            node.left = TreeNode(arr[i])
            queue.append(node.left)
        i += 1
        
        # Right child
        if i < len(arr) and arr[i] is not None:
            node.right = TreeNode(arr[i])
            queue.append(node.right)
        i += 1
    return root

def run_test(user_code, test_cases_json, method_name, type_map_json='{}'):
    namespace = {
        'ListNode': ListNode,
        'TreeNode': TreeNode
    }
    exec(user_code, namespace)

    if 'Solution' not in namespace:
        return {"error": "Class 'Solution' not found in your code"}

    solution_instance = namespace['Solution']()
    method = getattr(solution_instance, method_name, None)

    if not method:
        return {"error": f"Method '{method_name}' not found in class 'Solution'"}

    test_cases = json.loads(test_cases_json)
    type_map = json.loads(type_map_json)
    results = []

    for tc in test_cases:
        try:
            args = tc['input'].copy()
            
            # Generic Type Conversion based on type_map
            for arg_name, arg_type in type_map.items():
                if arg_name == 'return': continue
                if arg_name in args:
                    if arg_type == 'ListNode':
                        args[arg_name] = create_linked_list(args[arg_name])
                    elif arg_type == 'TreeNode':
                        args[arg_name] = list_to_tree(args[arg_name])

            # Execute
            actual = method(**args)

            # Generic Return Conversion
            if type_map.get('return') == 'ListNode':
                actual = linked_list_to_list(actual)

            expected = tc['expected']
            passed = actual == expected
            
            results.append({
                "input": tc['input'],
                "expected": expected,
                "actual": actual,
                "passed": passed
            })
        except Exception as e:
            results.append({
                "input": tc['input'],
                "expected": tc['expected'],
                "actual": None,
                "passed": False,
                "error": str(e)
            })

    return {"results": results}

run_test
`;

// Handle messages from main thread
self.onmessage = async function (e) {
  const { type, payload, id } = e.data;

  try {
    if (type === 'init') {
      await initPyodide();
      self.postMessage({ id, type: 'init-complete', success: true });
    }
    else if (type === 'run-tests') {
      const { userCode, testCases, functionName, typeMap } = payload;

      if (!pyodide) {
        await initPyodide();
      }

      // Execute the wrapper and get the run_test function
      const runTest = pyodide.runPython(pythonWrapper);

      // Run the tests
      const resultProxy = runTest(
        userCode, 
        JSON.stringify(testCases), 
        functionName, 
        JSON.stringify(typeMap || {})
      );
      const result = resultProxy.toJs({ dict_converter: Object.fromEntries });

      if (result.error) {
        self.postMessage({ id, type: 'error', error: result.error });
      } else {
        // Convert proxy results to plain JS objects
        const results = result.results.map(r => ({
          input: r.input instanceof Map ? Object.fromEntries(r.input) : r.input,
          expected: r.expected,
          actual: r.actual,
          passed: r.passed,
          error: r.error || null
        }));
        self.postMessage({ id, type: 'results', results });
      }
    }
  } catch (error) {
    self.postMessage({ id, type: 'error', error: error.message || String(error) });
  }
};
