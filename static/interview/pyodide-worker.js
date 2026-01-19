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

def run_test(user_code, test_cases_json, method_name):
    namespace = {}
    exec(user_code, namespace)

    if 'Solution' not in namespace:
        return {"error": "Class 'Solution' not found in your code"}

    solution_instance = namespace['Solution']()
    method = getattr(solution_instance, method_name, None)

    if not method:
        return {"error": f"Method '{method_name}' not found in class 'Solution'"}

    test_cases = json.loads(test_cases_json)
    results = []

    for tc in test_cases:
        try:
            args = tc['input']
            expected = tc['expected']
            actual = method(**args)

            passed = actual == expected
            results.append({
                "input": args,
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
      const { userCode, testCases, functionName } = payload;

      if (!pyodide) {
        await initPyodide();
      }

      // Execute the wrapper and get the run_test function
      const runTest = pyodide.runPython(pythonWrapper);

      // Run the tests
      const resultProxy = runTest(userCode, JSON.stringify(testCases), functionName);
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
