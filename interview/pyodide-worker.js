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
import copy
import json
import time

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
    if not arr:
        return None
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
    if not arr:
        return None
    if arr[0] is None:
        return None

    root = TreeNode(arr[0])
    queue = [root]
    index = 1

    while queue and index < len(arr):
        node = queue.pop(0)

        if index < len(arr) and arr[index] is not None:
            node.left = TreeNode(arr[index])
            queue.append(node.left)
        index += 1

        if index < len(arr) and arr[index] is not None:
            node.right = TreeNode(arr[index])
            queue.append(node.right)
        index += 1

    return root

def tree_to_list(root):
    if root is None:
        return []

    result = []
    queue = [root]

    while queue:
        node = queue.pop(0)
        if node is None:
            result.append(None)
            continue

        result.append(node.val)
        queue.append(node.left)
        queue.append(node.right)

    while result and result[-1] is None:
        result.pop()

    return result

def convert_inputs(raw_args, type_map):
    args = copy.deepcopy(raw_args)

    for arg_name, arg_type in type_map.items():
        if arg_name == 'return' or arg_name not in args:
            continue
        if arg_type == 'ListNode':
            args[arg_name] = create_linked_list(args[arg_name])
        elif arg_type == 'TreeNode':
            args[arg_name] = list_to_tree(args[arg_name])

    return args

def normalize_output(actual, type_map):
    return_type = type_map.get('return')

    if return_type == 'ListNode' or isinstance(actual, ListNode):
        return linked_list_to_list(actual)
    if return_type == 'TreeNode' or isinstance(actual, TreeNode):
        return tree_to_list(actual)

    return actual

def get_threshold_ms(test_case):
    value = test_case.get('maxDurationMs')
    if value is None:
        value = test_case.get('maxTimeMs')
    if value is None:
        value = test_case.get('thresholdMs')
    return value

def run_suite(method, suite_name, test_cases, type_map):
    results = []

    for index, test_case in enumerate(test_cases):
        has_expected = 'expected' in test_case
        expected = copy.deepcopy(test_case.get('expected'))
        raw_input = copy.deepcopy(test_case.get('input', {}))
        label = test_case.get('label') or test_case.get('name') or f"{suite_name.title()} #{index + 1}"
        threshold_ms = get_threshold_ms(test_case)
        started_at = time.perf_counter()

        try:
            args = convert_inputs(test_case.get('input', {}), type_map)
            actual = normalize_output(method(**args), type_map)
            duration_ms = round((time.perf_counter() - started_at) * 1000, 3)

            passed = True if not has_expected else actual == expected
            if threshold_ms is not None:
                passed = passed and duration_ms <= float(threshold_ms)

            result = {
                'index': index + 1,
                'label': label,
                'passed': passed,
                'durationMs': duration_ms,
                'error': None
            }

            if threshold_ms is not None:
                result['thresholdMs'] = float(threshold_ms)

            if suite_name == 'public':
                result['input'] = raw_input
                result['expected'] = expected
                result['actual'] = actual

            results.append(result)
        except Exception as exc:
            duration_ms = round((time.perf_counter() - started_at) * 1000, 3)
            result = {
                'index': index + 1,
                'label': label,
                'passed': False,
                'durationMs': duration_ms,
                'error': str(exc)
            }

            if threshold_ms is not None:
                result['thresholdMs'] = float(threshold_ms)

            if suite_name == 'public':
                result['input'] = raw_input
                result['expected'] = expected
                result['actual'] = None

            results.append(result)

    return results

def summarize_results(results, include_cases=False):
    total = len(results)
    passed = sum(1 for result in results if result.get('passed'))
    failed = total - passed
    duration_ms = round(sum(result.get('durationMs', 0) for result in results), 3)
    durations = [result.get('durationMs', 0) for result in results]

    summary = {
        'total': total,
        'passed': passed,
        'failed': failed,
        'allPassed': failed == 0,
        'durationMs': duration_ms,
        'averageDurationMs': round(duration_ms / total, 3) if total else 0,
        'minDurationMs': round(min(durations), 3) if durations else 0,
        'maxDurationMs': round(max(durations), 3) if durations else 0,
        'errorCount': sum(1 for result in results if result.get('error'))
    }

    if include_cases:
        summary['cases'] = [
            {
                'index': result.get('index'),
                'label': result.get('label'),
                'passed': result.get('passed'),
                'durationMs': result.get('durationMs', 0),
                'thresholdMs': result.get('thresholdMs'),
                'error': result.get('error')
            }
            for result in results
        ]

    return summary

def build_totals(public_summary, hidden_summary, perf_summary):
    total = public_summary['total'] + hidden_summary['total'] + perf_summary['total']
    passed = public_summary['passed'] + hidden_summary['passed'] + perf_summary['passed']
    failed = total - passed

    return {
        'total': total,
        'passed': passed,
        'failed': failed,
        'allPassed': failed == 0,
        'durationMs': round(
            public_summary['durationMs'] + hidden_summary['durationMs'] + perf_summary['durationMs'],
            3
        ),
        'publicTotal': public_summary['total'],
        'publicPassed': public_summary['passed'],
        'hiddenTotal': hidden_summary['total'],
        'hiddenPassed': hidden_summary['passed'],
        'perfTotal': perf_summary['total'],
        'perfPassed': perf_summary['passed']
    }

def run_test_suites(user_code, suites_json, method_name, type_map_json='{}'):
    namespace = {
        'ListNode': ListNode,
        'TreeNode': TreeNode
    }
    exec(user_code, namespace)

    if 'Solution' not in namespace:
        return json.dumps({'error': "Class 'Solution' not found in your code"})

    solution_instance = namespace['Solution']()
    method = getattr(solution_instance, method_name, None)

    if not method:
        return json.dumps({'error': f"Method '{method_name}' not found in class 'Solution'"})

    suites = json.loads(suites_json or '{}')
    type_map = json.loads(type_map_json or '{}')

    public_results = run_suite(method, 'public', suites.get('public', []), type_map)
    hidden_results = run_suite(method, 'hidden', suites.get('hidden', []), type_map)
    perf_results = run_suite(method, 'perf', suites.get('perf', []), type_map)

    hidden_summary = summarize_results(hidden_results)
    perf_summary = summarize_results(perf_results, include_cases=True)
    perf_summary['thresholdFailures'] = sum(
        1
        for result in perf_results
        if result.get('thresholdMs') is not None and not result.get('passed') and not result.get('error')
    )

    public_summary = summarize_results(public_results)

    return json.dumps({
        'public': public_results,
        'hiddenSummary': hidden_summary,
        'perfSummary': perf_summary,
        'totals': build_totals(public_summary, hidden_summary, perf_summary)
    })

run_test_suites
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
      const { userCode, suites, testCases, functionName, typeMap } = payload;

      if (!pyodide) {
        await initPyodide();
      }

      const normalizedSuites = suites || {
        public: Array.isArray(testCases) ? testCases : [],
        hidden: [],
        perf: []
      };

      // Execute the wrapper and get the run_test_suites function
      const runTestSuites = pyodide.runPython(pythonWrapper);

      // Run the tests
      const resultJson = runTestSuites(
        userCode,
        JSON.stringify(normalizedSuites),
        functionName,
        JSON.stringify(typeMap || {})
      );

      const resultText = typeof resultJson === 'string' ? resultJson : resultJson.toString();
      if (typeof resultJson?.destroy === 'function') {
        resultJson.destroy();
      }
      if (typeof runTestSuites?.destroy === 'function') {
        runTestSuites.destroy();
      }

      const result = JSON.parse(resultText);

      if (result.error) {
        self.postMessage({ id, type: 'error', error: result.error });
      } else {
        self.postMessage({ id, type: 'results', results: result });
      }
    }
  } catch (error) {
    self.postMessage({ id, type: 'error', error: error.message || String(error) });
  }
};
