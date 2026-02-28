// Code Runner for Live Interview Feature (Pyodide via Web Worker)
// This avoids AMD loader conflicts with Monaco Editor

let worker = null;
let messageId = 0;
const pendingMessages = new Map();

/**
 * Initialize the Pyodide Web Worker
 */
function getWorker() {
  if (worker) return worker;

  worker = new Worker('/interview/pyodide-worker.js');

  worker.onmessage = function (e) {
    const { id, type, results, error, success } = e.data;
    const pending = pendingMessages.get(id);

    if (pending) {
      pendingMessages.delete(id);

      if (type === 'error') {
        pending.reject(new Error(error));
      } else if (type === 'results') {
        pending.resolve(results);
      } else if (type === 'init-complete') {
        pending.resolve(success);
      }
    }
  };

  worker.onerror = function (e) {
    console.error('[Interview] Worker error:', e);
  };

  return worker;
}

/**
 * Send message to worker and wait for response
 */
function sendToWorker(type, payload = {}) {
  return new Promise((resolve, reject) => {
    const id = ++messageId;
    pendingMessages.set(id, { resolve, reject });
    getWorker().postMessage({ type, payload, id });
  });
}

/**
 * Run all test cases against user code using Pyodide (via Web Worker)
 */
export async function runTests(userCode, testCases, functionName = 'twoSum', typeMap = {}, onProgress) {
  try {
    const results = await sendToWorker('run-tests', {
      userCode,
      testCases,
      functionName,
      typeMap
    });

    return results;
  } catch (error) {
    console.error("[Interview] Pyodide error:", error);
    throw error;
  }
}

/**
 * Get a summary of test results
 */
export function getTestSummary(results) {
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  const score = total === 0 ? 0 : Math.round((passed / total) * 100);

  let band = 'Needs Work';
  if (score === 100) {
    band = 'Excellent';
  } else if (score >= 80) {
    band = 'Strong';
  } else if (score >= 60) {
    band = 'Good';
  }

  return {
    total,
    passed,
    failed,
    allPassed: passed === total,
    score,
    band
  };
}

/**
 * Format a value for display, handling null/undefined/None properly
 */
function formatValue(value) {
  if (value === undefined) return 'None';
  if (value === null) return 'None';
  return JSON.stringify(value);
}

/**
 * Format test results as HTML (Modern Premium Style)
 */
export function formatResultsHTML(results) {
  const summary = getTestSummary(results);

  let html = `<div class="test-summary ${summary.allPassed ? 'all-passed' : 'has-failures'}">`;
  html += `<span>${summary.allPassed ? '🚀' : '⚠️'}</span>`;
  html += `<strong>${summary.passed}/${summary.total} Tests Passed</strong>`;
  html += `<span style="margin-left:auto;"><strong>Score: ${summary.score}%</strong> (${summary.band})</span>`;
  html += `</div>`;

  html += '<div class="test-cases">';

  results.forEach((result, index) => {
    const statusClass = result.passed ? 'passed' : 'failed';
    const statusIcon = result.passed ? '✅' : '❌';

    html += `<div class="test-case ${statusClass}">`;
    html += `<div class="test-header">`;
    html += `<span class="test-name">Test Case #${index + 1}</span>`;
    html += `<span class="test-icon">${statusIcon}</span>`;
    html += `</div>`;

    html += `<div class="test-details">`;
    html += `<div><strong>Input:</strong> <code>${formatValue(result.input)}</code></div>`;
    html += `<div><strong>Expected:</strong> <code>${formatValue(result.expected)}</code></div>`;

    if (result.error) {
      html += `<div class="test-error"><strong>Error:</strong> ${result.error}</div>`;
    } else {
      html += `<div><strong>Got:</strong> <code>${formatValue(result.actual)}</code></div>`;
    }
    html += `</div>`;
    html += `</div>`;
  });

  html += '</div>';

  return html;
}

export default {
  runTests,
  getTestSummary,
  formatResultsHTML
};
