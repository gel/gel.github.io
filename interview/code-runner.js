// Code Runner for Live Interview Feature (Pyodide via Web Worker)
// This avoids AMD loader conflicts with Monaco Editor

let worker = null;
let messageId = 0;
const pendingMessages = new Map();

const DEFAULT_TIMEOUT_MS = 5000;
const PERF_TIMEOUT_MS = 10000;

function rejectPending(error) {
  pendingMessages.forEach(({ reject, timeoutId }) => {
    clearTimeout(timeoutId);
    reject(error);
  });
  pendingMessages.clear();
}

function resetWorker(error = null) {
  if (worker) {
    worker.terminate();
    worker = null;
  }

  if (error) {
    rejectPending(error);
  }
}

/**
 * Initialize the Pyodide Web Worker
 */
function getWorker() {
  if (worker) return worker;

  worker = new Worker('/interview/pyodide-worker.js');

  worker.onmessage = function (e) {
    const { id, type, results, error, success } = e.data;
    const pending = pendingMessages.get(id);

    if (!pending) return;

    pendingMessages.delete(id);
    clearTimeout(pending.timeoutId);

    if (type === 'error') {
      pending.reject(new Error(error));
    } else if (type === 'results') {
      pending.resolve(results);
    } else if (type === 'init-complete') {
      pending.resolve(success);
    }
  };

  worker.onerror = function (e) {
    console.error('[Interview] Worker error:', e);
    resetWorker(new Error('Pyodide worker crashed while running tests.'));
  };

  return worker;
}

/**
 * Send message to worker and wait for response
 */
function sendToWorker(type, payload = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const id = ++messageId;
    const timeoutId = setTimeout(() => {
      resetWorker(new Error(`Test execution exceeded ${timeoutMs}ms and was aborted.`));
    }, timeoutMs);

    pendingMessages.set(id, { resolve, reject, timeoutId });
    getWorker().postMessage({ type, payload, id });
  });
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function pickArray(config, keys) {
  if (!isPlainObject(config)) return [];

  for (const key of keys) {
    if (Array.isArray(config[key])) {
      return config[key];
    }
  }

  return [];
}

function getProblemConfigFallback() {
  if (typeof window === 'undefined') return null;
  return isPlainObject(window.problemConfig) ? window.problemConfig : null;
}

function getThresholdMs(testCase) {
  if (!isPlainObject(testCase)) return 0;

  const value = testCase.maxDurationMs ?? testCase.maxTimeMs ?? testCase.thresholdMs;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : 0;
}

function normalizeTestConfig(testCasesOrConfig, functionName, typeMap) {
  const fallbackConfig = getProblemConfigFallback();
  const config = Array.isArray(testCasesOrConfig)
    ? null
    : (isPlainObject(testCasesOrConfig) ? testCasesOrConfig : fallbackConfig);

  const publicTests = Array.isArray(testCasesOrConfig)
    ? testCasesOrConfig
    : pickArray(config, ['public', 'publicTests', 'testCases']);
  const hiddenTests = pickArray(config, ['hidden', 'hiddenTests']);
  const perfTests = pickArray(config, ['perf', 'perfTests', 'performance', 'performanceTests']);

  const normalizedTypeMap = isPlainObject(typeMap) && Object.keys(typeMap).length > 0
    ? typeMap
    : (isPlainObject(config?.typeMap) ? config.typeMap : {});

  const normalizedFunctionName = functionName
    || config?.methodName
    || config?.functionName
    || fallbackConfig?.methodName
    || 'twoSum';

  const explicitTimeoutMs = Number(config?.timeoutMs ?? config?.testTimeoutMs ?? 0);
  const perfThresholdMs = perfTests.reduce((maxValue, testCase) => {
    return Math.max(maxValue, getThresholdMs(testCase));
  }, 0);

  const timeoutMs = Math.max(
    DEFAULT_TIMEOUT_MS,
    perfTests.length > 0 ? PERF_TIMEOUT_MS : 0,
    Number.isFinite(explicitTimeoutMs) && explicitTimeoutMs > 0 ? explicitTimeoutMs : 0,
    perfThresholdMs > 0 ? Math.ceil(perfThresholdMs * 4) : 0
  );

  return {
    functionName: normalizedFunctionName,
    typeMap: normalizedTypeMap,
    suites: {
      public: publicTests,
      hidden: hiddenTests,
      perf: perfTests
    },
    timeoutMs
  };
}

function createEmptySummary(extra = {}) {
  return {
    total: 0,
    passed: 0,
    failed: 0,
    allPassed: true,
    durationMs: 0,
    averageDurationMs: 0,
    minDurationMs: 0,
    maxDurationMs: 0,
    errorCount: 0,
    ...extra
  };
}

function decorateStructuredResults(results) {
  const publicResults = Array.isArray(results?.public) ? results.public : [];
  const structuredResults = {
    public: publicResults,
    hiddenSummary: isPlainObject(results?.hiddenSummary) ? results.hiddenSummary : createEmptySummary(),
    perfSummary: isPlainObject(results?.perfSummary) ? results.perfSummary : createEmptySummary({ cases: [], thresholdFailures: 0 }),
    totals: isPlainObject(results?.totals) ? results.totals : createEmptySummary()
  };

  const arrayMethods = ['map', 'filter', 'forEach', 'some', 'every', 'find', 'reduce', 'slice', 'at'];

  for (const method of arrayMethods) {
    Object.defineProperty(structuredResults, method, {
      enumerable: false,
      value: (...args) => {
        if (typeof publicResults[method] !== 'function') return undefined;
        return publicResults[method](...args);
      }
    });
  }

  Object.defineProperty(structuredResults, 'length', {
    enumerable: false,
    get: () => publicResults.length
  });

  Object.defineProperty(structuredResults, Symbol.iterator, {
    enumerable: false,
    value: () => publicResults[Symbol.iterator]()
  });

  return structuredResults;
}

function getPublicResults(results) {
  return Array.isArray(results) ? results : (Array.isArray(results?.public) ? results.public : []);
}

function formatMs(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return '0 ms';
  return `${numericValue.toFixed(numericValue >= 100 ? 0 : 2)} ms`;
}

/**
 * Run all test cases against user code using Pyodide (via Web Worker)
 */
export async function runTests(userCode, testCases, functionName = 'twoSum', typeMap = {}, onProgress) {
  try {
    const normalized = normalizeTestConfig(testCases, functionName, typeMap);
    const results = await sendToWorker('run-tests', {
      userCode,
      suites: normalized.suites,
      functionName: normalized.functionName,
      typeMap: normalized.typeMap
    }, normalized.timeoutMs);

    return decorateStructuredResults(results);
  } catch (error) {
    console.error('[Interview] Pyodide error:', error);
    throw error;
  }
}

/**
 * Get a summary of test results
 */
export function getTestSummary(results) {
  const publicResults = getPublicResults(results);
  const total = publicResults.length;
  const passed = publicResults.filter(r => r.passed).length;
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

function formatSuiteSummary(label, summary, details = '') {
  if (!summary || summary.total === 0) return '';

  const statusClass = summary.allPassed ? 'all-passed' : 'has-failures';
  const icon = summary.allPassed ? '✅' : '⚠️';
  const suffix = details ? ` <span style="margin-left:auto;">${details}</span>` : '';

  return `<div class="test-summary ${statusClass}"><span>${icon}</span><strong>${label}: ${summary.passed}/${summary.total} Passed</strong>${suffix}</div>`;
}

/**
 * Format test results as HTML (Modern Premium Style)
 */
export function formatResultsHTML(results) {
  const summary = getTestSummary(results);
  const publicResults = getPublicResults(results);
  const hiddenSummary = Array.isArray(results) ? null : results.hiddenSummary;
  const perfSummary = Array.isArray(results) ? null : results.perfSummary;
  const totals = Array.isArray(results) ? null : results.totals;
  const displaySummary = summary.total > 0 || !totals
    ? summary
    : {
      total: totals.total,
      passed: totals.passed,
      failed: totals.failed,
      allPassed: totals.allPassed,
      score: totals.total === 0 ? 0 : Math.round((totals.passed / totals.total) * 100),
      band: totals.allPassed ? 'Excellent' : 'Needs Work'
    };

  let html = `<div class="test-summary ${displaySummary.allPassed ? 'all-passed' : 'has-failures'}">`;
  html += `<span>${displaySummary.allPassed ? '🚀' : '⚠️'}</span>`;
  html += `<strong>${displaySummary.passed}/${displaySummary.total} Tests Passed</strong>`;
  html += `<span style="margin-left:auto;"><strong>Score: ${displaySummary.score}%</strong> (${displaySummary.band})</span>`;
  html += `</div>`;

  html += formatSuiteSummary('Hidden Tests', hiddenSummary);

  if (perfSummary?.total > 0) {
    const perfDetails = [
      `avg ${formatMs(perfSummary.averageDurationMs)}`,
      `max ${formatMs(perfSummary.maxDurationMs)}`
    ];

    if (perfSummary.thresholdFailures > 0) {
      perfDetails.push(`${perfSummary.thresholdFailures} over threshold`);
    }

    html += formatSuiteSummary('Performance Tests', perfSummary, perfDetails.join(' | '));
  }

  html += '<div class="test-cases">';

  publicResults.forEach((result, index) => {
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
    html += `<div><strong>Time:</strong> <code>${formatMs(result.durationMs)}</code></div>`;

    if (result.error) {
      html += `<div class="test-error"><strong>Error:</strong> ${result.error}</div>`;
    } else {
      html += `<div><strong>Got:</strong> <code>${formatValue(result.actual)}</code></div>`;
    }

    if (result.thresholdMs) {
      html += `<div><strong>Threshold:</strong> <code>${formatMs(result.thresholdMs)}</code></div>`;
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
