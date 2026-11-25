// Interview UI - Modular Architecture
import { runTests, getTestSummary } from './code-runner.js';
import {
  initEngine,
  isEngineReady,
  evaluateCode,
  getHint,
  generateCode,
  checkWebGPUSupport
} from './webllm-engine.js';

// Shared State
let editor = null;
let testResults = [];
let latestTestReport = null;

function getProblemConfig() {
  return window.problemConfig;
}

function getMonacoTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'vs-dark' : 'vs';
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatValue(value) {
  if (value === undefined || value === null) return 'None';

  try {
    return escapeHtml(JSON.stringify(value));
  } catch (error) {
    return escapeHtml(String(value));
  }
}

function getScoreBand(score) {
  if (score === 100) return 'Excellent';
  if (score >= 80) return 'Strong';
  if (score >= 60) return 'Good';
  return 'Needs Work';
}

function isTestCaseList(value) {
  return Array.isArray(value);
}

function pickTestCaseList(...candidates) {
  for (const candidate of candidates) {
    if (isTestCaseList(candidate)) {
      return candidate;
    }
  }

  return [];
}

function pickNumber(...candidates) {
  for (const candidate of candidates) {
    if (typeof candidate === 'number' && Number.isFinite(candidate)) {
      return candidate;
    }
  }

  return null;
}

function resolvePerformanceConfig(problemConfig) {
  const performanceConfig = (problemConfig.performance && typeof problemConfig.performance === 'object' && !Array.isArray(problemConfig.performance))
    ? problemConfig.performance
    : null;

  const testCases = pickTestCaseList(
    performanceConfig?.testCases,
    performanceConfig?.cases,
    performanceConfig?.tests,
    performanceConfig?.performanceTests,
    performanceConfig?.performanceTestCases,
    performanceConfig?.benchmarkCases,
    problemConfig.performance,
    problemConfig.performanceTests,
    problemConfig.performanceTestCases,
    problemConfig.benchmarkTests,
    problemConfig.benchmarkCases
  );

  return {
    testCases,
    label: performanceConfig?.label || problemConfig.performanceLabel || 'Performance',
    description: performanceConfig?.description || problemConfig.performanceDescription || '',
    thresholdMs: pickNumber(
      performanceConfig?.thresholdMs,
      performanceConfig?.maxMs,
      performanceConfig?.maxDurationMs,
      performanceConfig?.budgetMs,
      performanceConfig?.targetMs,
      problemConfig.performanceThresholdMs,
      problemConfig.performanceMaxMs,
      problemConfig.performanceBudgetMs
    )
  };
}

function resolveTestConfig(problemConfig) {
  return {
    publicCases: pickTestCaseList(
      problemConfig.publicTests,
      problemConfig.publicTestCases,
      problemConfig.testCases
    ),
    hiddenCases: pickTestCaseList(
      problemConfig.hiddenTests,
      problemConfig.hiddenTestCases,
      problemConfig.privateTests,
      problemConfig.privateTestCases,
      problemConfig.secretTests,
      problemConfig.secretTestCases
    ),
    performance: resolvePerformanceConfig(problemConfig)
  };
}

function getResultsElement(id) {
  return document.getElementById(id);
}

function setResultsHTML(id, html) {
  const element = getResultsElement(id);
  if (element) {
    element.innerHTML = html;
  }
}

function renderPlaceholder(message, detail = '') {
  const detailMarkup = detail ? `<p>${escapeHtml(detail)}</p>` : '';
  return `<div class="results-placeholder"><p>${escapeHtml(message)}</p>${detailMarkup}</div>`;
}

function renderError(message) {
  return `<div class="test-error">Error running tests: ${escapeHtml(message)}</div>`;
}

function renderMetric(label, value, tone = '') {
  const toneClass = tone ? ` ${tone}` : '';
  return `
    <div class="result-metric${toneClass}">
      <span class="metric-label">${escapeHtml(label)}</span>
      <strong class="metric-value">${escapeHtml(value)}</strong>
    </div>
  `;
}

function renderSummaryBanner(summary, label) {
  return `
    <div class="test-summary ${summary.allPassed ? 'all-passed' : 'has-failures'}">
      <span>${summary.allPassed ? '🚀' : '⚠️'}</span>
      <strong>${escapeHtml(label)}</strong>
      <span>${summary.passed}/${summary.total} passed</span>
    </div>
  `;
}

function renderPublicTests(results) {
  if (!results.length) {
    return renderPlaceholder('No public tests configured for this problem.');
  }

  const summary = getTestSummary(results);
  const casesMarkup = results.map((result, index) => {
    const statusClass = result.passed ? 'passed' : 'failed';
    const statusIcon = result.passed ? '✅' : '❌';
    const gotMarkup = result.error
      ? `<div class="test-error"><strong>Error:</strong> ${escapeHtml(result.error)}</div>`
      : `<div><strong>Got:</strong> <code>${formatValue(result.actual)}</code></div>`;

    return `
      <div class="test-case ${statusClass}">
        <div class="test-header">
          <span class="test-name">Test Case #${index + 1}</span>
          <span class="test-icon">${statusIcon}</span>
        </div>
        <div class="test-details">
          <div><strong>Input:</strong> <code>${formatValue(result.input)}</code></div>
          <div><strong>Expected:</strong> <code>${formatValue(result.expected)}</code></div>
          ${gotMarkup}
        </div>
      </div>
    `;
  }).join('');

  return `
    ${renderSummaryBanner(summary, 'Public Tests')}
    <div class="test-cases">${casesMarkup}</div>
  `;
}

function renderHiddenTests(results, configured) {
  if (!configured) {
    return renderPlaceholder('No hidden tests configured for this problem.');
  }

  const summary = getTestSummary(results);
  const copy = summary.allPassed
    ? 'Hidden cases passed without exposing private inputs.'
    : 'Some hidden cases failed. Private inputs stay concealed.';

  return `
    ${renderSummaryBanner(summary, 'Hidden Tests')}
    <div class="results-summary-card">
      <p>${escapeHtml(copy)}</p>
      <div class="result-metrics-grid">
        ${renderMetric('Passed', `${summary.passed}/${summary.total}`, summary.allPassed ? 'positive' : '')}
        ${renderMetric('Failed', String(summary.failed), summary.failed ? 'negative' : '')}
        ${renderMetric('Score', `${summary.score}%`)}
      </div>
    </div>
  `;
}

function renderPerformance(performanceReport, configured) {
  if (!configured) {
    return renderPlaceholder('No performance checks configured for this problem.');
  }

  const thresholdMarkup = performanceReport.hasThreshold
    ? renderMetric('Budget', `${performanceReport.thresholdMs.toFixed(1)} ms`)
    : renderMetric('Budget', 'Not set');
  const summary = performanceReport.summary;
  const copy = performanceReport.passed
    ? 'Performance criteria met.'
    : 'Performance criteria not met.';

  return `
    <div class="performance-card ${performanceReport.passed ? 'passed' : 'failed'}">
      <div class="performance-header">
        <div>
          <strong>${escapeHtml(performanceReport.label)}</strong>
          <p>${escapeHtml(performanceReport.description || copy)}</p>
        </div>
        <span class="performance-badge ${performanceReport.passed ? 'passed' : 'failed'}">
          ${performanceReport.passed ? 'Pass' : 'Fail'}
        </span>
      </div>
      <div class="result-metrics-grid">
        ${renderMetric('Runtime', `${performanceReport.elapsedMs.toFixed(1)} ms`, performanceReport.passed ? 'positive' : 'negative')}
        ${thresholdMarkup}
        ${renderMetric('Correctness', `${summary.passed}/${summary.total} tests`)}
      </div>
    </div>
  `;
}

function buildOverallSummary(report) {
  const sections = [];
  const publicSummary = getTestSummary(report.publicResults);
  sections.push({ label: 'Public', passed: publicSummary.passed, total: publicSummary.total });

  if (report.hiddenConfigured) {
    const hiddenSummary = getTestSummary(report.hiddenResults);
    sections.push({ label: 'Hidden', passed: hiddenSummary.passed, total: hiddenSummary.total });
  }

  if (report.performanceConfigured) {
    sections.push({ label: 'Performance', passed: report.performanceReport.passed ? 1 : 0, total: 1 });
  }

  const total = sections.reduce((sum, section) => sum + section.total, 0);
  const passed = sections.reduce((sum, section) => sum + section.passed, 0);
  const score = total === 0 ? 0 : Math.round((passed / total) * 100);

  return {
    sections,
    total,
    passed,
    failed: Math.max(total - passed, 0),
    score,
    band: getScoreBand(score),
    allPassed: total > 0 && passed === total
  };
}

function renderOverview(report) {
  const overall = buildOverallSummary(report);
  const breakdownMarkup = overall.sections.map((section) => {
    return `
      <div class="score-breakdown-item">
        <span>${escapeHtml(section.label)}</span>
        <strong>${section.passed}/${section.total}</strong>
      </div>
    `;
  }).join('');

  return `
    <div class="score-card ${overall.allPassed ? 'all-passed' : 'has-failures'}">
      <div class="score-card-main">
        <span class="score-label">Overall Score</span>
        <strong class="score-value">${overall.score}%</strong>
        <span class="score-band">${escapeHtml(overall.band)}</span>
      </div>
      <div class="score-card-stats">
        ${renderMetric('Checks Passed', `${overall.passed}/${overall.total || 0}`, overall.allPassed ? 'positive' : '')}
        ${renderMetric('Failed', String(overall.failed), overall.failed ? 'negative' : '')}
      </div>
      <div class="score-breakdown">${breakdownMarkup}</div>
    </div>
  `;
}

function renderExecutionReport(report) {
  setResultsHTML('results-overview-content', renderOverview(report));
  setResultsHTML('results-public-content', renderPublicTests(report.publicResults));
  setResultsHTML('results-hidden-content', renderHiddenTests(report.hiddenResults, report.hiddenConfigured));
  setResultsHTML('results-performance-content', renderPerformance(report.performanceReport, report.performanceConfigured));
}

function renderExecutionError(message) {
  setResultsHTML('results-overview-content', renderError(message));
  setResultsHTML('results-public-content', renderError(message));
  setResultsHTML('results-hidden-content', renderPlaceholder('Hidden tests could not be evaluated because the run failed.'));
  setResultsHTML('results-performance-content', renderPlaceholder('Performance checks could not be evaluated because the run failed.'));
}

async function runTestGroup(userCode, testCases, problemConfig) {
  if (!Array.isArray(testCases) || testCases.length === 0) {
    return [];
  }

  return runTests(
    userCode,
    testCases,
    problemConfig.methodName,
    problemConfig.typeMap || {}
  );
}

async function runPerformanceGroup(userCode, performanceConfig, problemConfig) {
  const startedAt = window.performance?.now ? window.performance.now() : Date.now();
  const results = await runTestGroup(userCode, performanceConfig.testCases, problemConfig);
  const endedAt = window.performance?.now ? window.performance.now() : Date.now();
  const elapsedMs = endedAt - startedAt;
  const summary = getTestSummary(results);
  const hasThreshold = typeof performanceConfig.thresholdMs === 'number';
  const withinBudget = !hasThreshold || elapsedMs <= performanceConfig.thresholdMs;

  return {
    label: performanceConfig.label,
    description: performanceConfig.description,
    elapsedMs,
    thresholdMs: performanceConfig.thresholdMs,
    hasThreshold,
    summary,
    passed: summary.allPassed && withinBudget
  };
}

async function executeInterviewTests(userCode) {
  const problemConfig = getProblemConfig();
  if (!problemConfig) {
    throw new Error('Problem configuration unavailable.');
  }

  const testConfig = resolveTestConfig(problemConfig);

  const publicResults = await runTestGroup(userCode, testConfig.publicCases, problemConfig);
  const hiddenResults = testConfig.hiddenCases.length
    ? await runTestGroup(userCode, testConfig.hiddenCases, problemConfig)
    : [];
  const performanceReport = testConfig.performance.testCases.length
    ? await runPerformanceGroup(userCode, testConfig.performance, problemConfig)
    : {
      label: testConfig.performance.label,
      description: testConfig.performance.description,
      elapsedMs: 0,
      thresholdMs: testConfig.performance.thresholdMs,
      hasThreshold: typeof testConfig.performance.thresholdMs === 'number',
      summary: getTestSummary([]),
      passed: false
    };

  return {
    publicResults,
    hiddenResults,
    performanceReport,
    hiddenConfigured: testConfig.hiddenCases.length > 0,
    performanceConfigured: testConfig.performance.testCases.length > 0
  };
}

function renderInitialResultsState() {
  const problemConfig = getProblemConfig();
  if (!problemConfig) return;

  const testConfig = resolveTestConfig(problemConfig);
  setResultsHTML('results-overview-content', renderPlaceholder('Run tests to see the overall score, band, and section breakdown.'));
  setResultsHTML('results-public-content', renderPlaceholder('Public test details will appear here after you run your solution.'));

  if (!testConfig.hiddenCases.length) {
    setResultsHTML('results-hidden-content', renderPlaceholder('No hidden tests configured for this problem.'));
  }

  if (!testConfig.performance.testCases.length) {
    setResultsHTML('results-performance-content', renderPlaceholder('No performance checks configured for this problem.'));
  }
}

// --- 1. Engine Manager (Shared Service) ---
const EngineManager = {
  async ensureReady(onProgress) {
    if (isEngineReady()) return true;

    const gpuCheck = checkWebGPUSupport();
    if (!gpuCheck.supported) {
      throw new Error(gpuCheck.message);
    }

    // Default empty handler if none provided
    const defaultProgress = (progress, text) => { };

    await initEngine(onProgress || defaultProgress);
    return true;
  }
};

// --- 2. Code Assistant (Top Widget) ---
const CodeAssistant = {
  init() {
    this.input = document.getElementById('ai-code-prompt');
    this.btn = document.getElementById('ai-code-submit');
    this.statusEl = document.getElementById('ai-code-status');

    if (!this.input || !this.btn) return;

    this.btn.addEventListener('click', () => this.handleSubmit());
    this.input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSubmit();
    });
  },

  setLoading(isLoading) {
    this.input.disabled = isLoading;
    this.btn.disabled = isLoading;
    if (isLoading) {
      this.btn.classList.add('is-loading');
      this.btn.innerHTML = '<span>⏳</span>';
    } else {
      this.btn.classList.remove('is-loading');
      this.btn.innerHTML = '<span>➤</span>';
    }
  },

  setStatus(msg, type = 'info') {
    if (!this.statusEl) return;
    this.statusEl.textContent = msg;
    this.statusEl.className = `assistant-status ${type}`;
    if (type === 'error' || type === 'info') {
      setTimeout(() => {
        if (this.statusEl) this.statusEl.textContent = '';
      }, 5000);
    }
  },

  async handleSubmit() {
    const prompt = this.input.value.trim();
    if (!prompt) return;

    const currentCode = getEditorCode();
    this.setLoading(true);
    this.setStatus('');

    try {
      // Initialize if needed, showing global loader AND local text
      await EngineManager.ensureReady((progress, text) => {
        this.setStatus(text || `Initializing ${Math.round(progress * 100)}%`, 'info');
      });

      const newCode = await generateCode(prompt, currentCode);

      if (editor && newCode) {
        editor.setValue(newCode);
        editor.getAction('editor.action.formatDocument').run();
      }
      this.input.value = '';
      this.setStatus('Code updated successfully', 'info');

    } catch (error) {
      console.error('Code Assistant Error:', error);
      this.setStatus(error.message || 'Generation failed', 'error');
    } finally {
      this.setLoading(false);
      this.input.focus();
    }
  }
};

// --- 3. Interviewer (Bottom Chat) ---
const Interviewer = {
  init() {
    const runTestsBtn = document.getElementById('run-tests');
    const submitBtn = document.getElementById('submit-solution');
    const hintBtn = document.getElementById('get-hint');

    if (runTestsBtn) runTestsBtn.addEventListener('click', () => this.handleRunTests());
    if (submitBtn) submitBtn.addEventListener('click', () => this.handleSubmitForReview());
    if (hintBtn) hintBtn.addEventListener('click', () => this.handleGetHint());

    // Check GPU support quietly on load
    const gpuCheck = checkWebGPUSupport();
    if (!gpuCheck.supported) {
      const statusText = document.querySelector('.status-text');
      if (statusText) statusText.innerHTML = `<span class="warning">${gpuCheck.message}</span> You can still run tests locally.`;
    }
  },

  updateStatus(progress, text) {
    const statusText = document.querySelector('.status-text');
    if (statusText) statusText.textContent = text || (progress ? `Loading Model... ${Math.round(progress * 100)}%` : "");
  },

  showFeedback(content, isStreaming = false) {
    const feedbackContent = document.getElementById('feedback-content');
    if (!feedbackContent) return;

    // Scroll logic
    const scrollContainer = document.querySelector('.page');
    let shouldAutoScroll = false;

    if (isStreaming && scrollContainer) {
      const distanceToBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight;
      shouldAutoScroll = distanceToBottom < 150;
    } else if (!isStreaming) {
      shouldAutoScroll = true;
    }

    if (isStreaming) {
      feedbackContent.innerHTML = `<div class="streaming-response">${content}</div>`;
      if (shouldAutoScroll) feedbackContent.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } else {
      feedbackContent.innerHTML = content;
      const container = feedbackContent.closest('.ai-feedback');
      if (container && shouldAutoScroll) container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  },

  formatMarkdown(text) {
    if (!text) return '';
    return text
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  },

  async handleRunTests() {
    const code = getEditorCode();
    const resultsContainer = document.getElementById('test-results-content');
    const runBtn = document.getElementById('run-tests');

    if (!resultsContainer) return;
    if (runBtn) { runBtn.disabled = true; runBtn.textContent = 'Running...'; }

    try {
      latestTestReport = await executeInterviewTests(code);
      testResults = latestTestReport.publicResults;
      renderExecutionReport(latestTestReport);
      resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (error) {
      latestTestReport = null;
      testResults = [];
      renderExecutionError(error.message);
    } finally {
      if (runBtn) { runBtn.disabled = false; runBtn.textContent = 'Run Tests'; }
    }
  },

  async handleSubmitForReview() {
    const submitBtn = document.getElementById('submit-solution');
    const code = getEditorCode();

    if (!latestTestReport) await this.handleRunTests();

    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Loading AI...'; }

    try {
      this.showFeedback('<p class="loading-message">Initializing AI model...</p>');

      // Pass 'this.updateStatus' to update local text while global bar handles the heavy lifting
      await EngineManager.ensureReady((p, t) => this.updateStatus(p, t));

      if (submitBtn) submitBtn.textContent = 'Analyzing...';
      this.showFeedback('<p class="loading-message">AI is reviewing your code...</p>');

      const prompt = `
        You are a senior engineering interviewer. Review this solution.
        Be professional, encouraging, but rigorous about complexity.
        Format response in conversational tone.
      `;

      let streamedContent = '';
      const currentProblem = getProblemConfig();
      await evaluateCode(
        `${prompt}\n\nProblem: ${currentProblem.description}`,
        code,
        testResults,
        (token, fullText) => {
          streamedContent = fullText;
          this.showFeedback(this.formatMarkdown(streamedContent), true);
        }
      );
      this.showFeedback(`<div class="ai-response">${this.formatMarkdown(streamedContent)}</div>`);

    } catch (error) {
      console.error(error);
      this.showFeedback(`<div class="feedback-error"><p><strong>Error</strong></p><p>${error.message}</p></div>`);
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit for Review'; }
    }
  },

  async handleGetHint() {
    const hintBtn = document.getElementById('get-hint');
    const code = getEditorCode();

    if (hintBtn) { hintBtn.disabled = true; hintBtn.textContent = 'Loading...'; }

    try {
      this.showFeedback('<p class="loading-message">Getting hint...</p>');
      await EngineManager.ensureReady((p, t) => this.updateStatus(p, t));

      let streamedContent = '';
      const currentProblem = getProblemConfig();
      await getHint(
        currentProblem.description,
        code,
        (token, fullText) => {
          streamedContent = fullText;
          this.showFeedback(`<div class="hint-response"><strong>💡 Hint:</strong> ${this.formatMarkdown(streamedContent)}</div>`, true);
        }
      );
    } catch (error) {
      this.showFeedback(`<div class="feedback-error"><p><strong>Error</strong></p><p>${error.message}</p></div>`);
    } finally {
      if (hintBtn) { hintBtn.disabled = false; hintBtn.textContent = 'Hint'; }
    }
  }
};

// --- Helper Functions ---
function getEditorCode() {
  if (!editor) return getProblemConfig()?.starterCode || "";
  return editor.getValue();
}

function initEditor() {
  const editorContainer = document.getElementById('code-editor');
  if (!editorContainer) return;

  // Poll for Monaco availability and problem configuration
  let attempts = 0;
  const pollInterval = setInterval(() => {
    attempts++;
    const problemConfig = getProblemConfig();

    if (window.MonacoEditor && problemConfig && !editor) {
      clearInterval(pollInterval);
      try {
        editorContainer.innerHTML = '';
        editorContainer.style.height = '500px';
        editorContainer.style.width = '100%';

        editor = window.MonacoEditor.editor.create(editorContainer, {
          value: problemConfig.starterCode,
          language: 'python',
          theme: getMonacoTheme(),
          fontSize: 15,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true, // Crucial for mobile/resize responsiveness
          wordWrap: 'on',
          lineNumbers: 'on',
          folding: true,
          tabSize: 4,
          insertSpaces: true
        });

        editor.layout();

        // --- Mobile/Chrome Robustness Fixes ---

        // 1. Force another layout after a short delay
        setTimeout(() => {
          if (editor) {
            editor.layout();
            console.log('[Interview] Safety layout triggered');

            // 2. Double check initial value MUST be set (sometimes Chrome/Monaco misbehaves)
            if (editor.getValue() === "" && problemConfig.starterCode) {
              editor.setValue(problemConfig.starterCode);
              console.log('[Interview] Safety value reset triggered');
            }
          }
        }, 500);

        // 3. ResizeObserver to handle layout changes dynamically (more robust than automaticLayout)
        if (window.ResizeObserver) {
          const resizeObserver = new ResizeObserver(() => {
            if (editor) {
              editor.layout();
            }
          });
          resizeObserver.observe(editorContainer);
        }

        console.log('[Interview] Monaco editor created');
      } catch (e) {
        console.error('Editor Init Error', e);
      }
    } else if (attempts > 100) {
      clearInterval(pollInterval);
      console.error('[Interview] Monaco Editor or Problem Config loading timed out');
    }
  }, 100);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  // Extract description if not already set (Zola templates might not have it in JS)
  const problemConfig = getProblemConfig();
  if (problemConfig && !problemConfig.description) {
    const descriptionEl = document.querySelector('.problem-description');
    if (descriptionEl) {
      problemConfig.description = descriptionEl.innerText.trim();
    }
  }

  renderInitialResultsState();
  initEditor();
  CodeAssistant.init();
  Interviewer.init();

  window.addEventListener('themeChanged', () => {
    if (window.MonacoEditor && editor) {
      window.MonacoEditor.editor.setTheme(getMonacoTheme());
    }
  });
}

export default { init };
