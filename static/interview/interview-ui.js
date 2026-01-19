// Interview UI - Main entry point for Live Interview feature
import { runTests, formatResultsHTML, getTestSummary } from './code-runner.js';
import {
  initEngine,
  isEngineReady,
  isEngineLoading,
  evaluateCode,
  getHint,
  checkWebGPUSupport
} from './webllm-engine.js';

// Test cases for Two Sum problem
const TWO_SUM_TEST_CASES = [
  { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
  { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
  { input: { nums: [3, 3], target: 6 }, expected: [0, 1] },
  { input: { nums: [1, 2, 3, 4, 5], target: 9 }, expected: [3, 4] },
  { input: { nums: [-1, -2, -3, -4, -5], target: -8 }, expected: [2, 4] }
];

// Problem description for AI context
const PROBLEM_DESCRIPTION = `Two Sum: Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.`;

// Default starter code (Python)
const STARTER_CODE = `from typing import List

class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Hash map to store the value and its index
        num_map = {}

        for i, num in enumerate(nums):
            complement = target - num
            if complement in num_map:
                return [num_map[complement], i]
            num_map[num] = i

        return [] # Should not happen based on constraints`;

// Global state
let editor = null;
let testResults = [];

/**
 * Initialize Monaco editor
 */
function initEditor() {
  const editorContainer = document.getElementById('code-editor');
  if (!editorContainer) {
    console.error('[Interview] Editor container not found');
    return;
  }

  let editorCreated = false;

  function createEditor() {
    // Prevent multiple creations
    if (editorCreated || editor) {
      console.log('[Interview] Editor already created, skipping');
      return true;
    }

    if (!window.MonacoEditor) {
      console.log('[Interview] Monaco Editor not ready yet');
      return false;
    }

    console.log('[Interview] Creating Monaco editor with starter code...');
    console.log('[Interview] STARTER_CODE length:', STARTER_CODE.length);

    try {
      const monaco = window.MonacoEditor;

      // Clear container first
      editorContainer.innerHTML = '';

      // IMPORTANT: Set explicit container dimensions BEFORE creating Monaco
      // Monaco reads clientHeight during init and will be 0 if height is auto/unset
      editorContainer.style.height = '500px';
      editorContainer.style.width = '100%';
      editorContainer.style.maxWidth = '100%';
      editorContainer.style.overflow = 'hidden';

      // Create Monaco editor instance
      editor = monaco.editor.create(editorContainer, {
        value: STARTER_CODE,
        language: 'python',
        theme: 'vs-dark',
        fontSize: 15,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: false,
        wordWrap: 'on',
        lineNumbers: 'on',
        folding: true,
        tabSize: 4,
        insertSpaces: true
      });

      // Force layout recalculation
      editor.layout();

      editorCreated = true;
      console.log('[Interview] Monaco editor created successfully');
      console.log('[Interview] Editor content length:', editor.getValue().length);
      return true;
    } catch (err) {
      console.error('[Interview] Error creating Monaco editor:', err);
      return false;
    }
  }

  // Try to create editor immediately if Monaco is ready
  if (createEditor()) return;

  // Event handler with cleanup
  function onMonacoReady() {
    if (createEditor()) {
      window.removeEventListener('monaco-ready', onMonacoReady);
    }
  }
  window.addEventListener('monaco-ready', onMonacoReady);

  // Poll as a fallback
  let attempts = 0;
  const maxAttempts = 100; // 10 seconds max
  const pollInterval = setInterval(() => {
    attempts++;
    if (createEditor()) {
      clearInterval(pollInterval);
      window.removeEventListener('monaco-ready', onMonacoReady);
    } else if (attempts >= maxAttempts) {
      console.error('[Interview] Gave up waiting for Monaco Editor after', maxAttempts * 100, 'ms');
      clearInterval(pollInterval);
    }
  }, 100);
}

/**
 * Get current code from editor
 */
function getEditorCode() {
  if (!editor) return STARTER_CODE;
  return editor.getValue();
}

/**
 * Handle Run Tests button click
 */
async function handleRunTests() {
  const code = getEditorCode();
  const resultsContainer = document.getElementById('test-results-content');
  const runBtn = document.getElementById('run-tests');

  if (!resultsContainer) return;

  if (runBtn) {
    runBtn.disabled = true;
    runBtn.textContent = 'Running...';
  }

  try {
    testResults = await runTests(code, TWO_SUM_TEST_CASES, 'twoSum', updateProgress);
    resultsContainer.innerHTML = formatResultsHTML(testResults);

    // Smooth scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } catch (error) {
    resultsContainer.innerHTML = `<div class="test-error">Error running tests: ${error.message}</div>`;
  } finally {
    if (runBtn) {
      runBtn.disabled = false;
      runBtn.textContent = 'Run Tests';
    }
  }
}

/**
 * Update model loading progress UI
 */
function updateProgress(progress, text) {
  const progressContainer = document.getElementById('progress-container');
  const progressBar = document.getElementById('progress-bar');
  const statusText = document.querySelector('.status-text');

  if (progressContainer) progressContainer.style.display = 'block';
  if (progressBar) progressBar.style.width = `${progress * 100}%`;
  if (statusText) statusText.textContent = text || `Loading Pyodide... ${Math.round(progress * 100)}%`;
}

/**
 * Show feedback content
 */
function showFeedback(content, isStreaming = false) {
  const feedbackContent = document.getElementById('feedback-content');
  if (!feedbackContent) return;

  if (isStreaming) {
    feedbackContent.innerHTML = `<div class="streaming-response">${content}</div>`;
  } else {
    feedbackContent.innerHTML = content;
  }
}

/**
 * Handle Submit for Review button click
 */
async function handleSubmitForReview() {
  const submitBtn = document.getElementById('submit-solution');
  const code = getEditorCode();

  // Check WebGPU support
  const gpuCheck = checkWebGPUSupport();
  if (!gpuCheck.supported) {
    showFeedback(`<div class="feedback-error">
      <p><strong>WebGPU Not Supported</strong></p>
      <p>${gpuCheck.message}</p>
      <p>You can still run tests to check your solution correctness.</p>
    </div>`);
    return;
  }

  // Run tests first if not already done
  if (testResults.length === 0) {
    handleRunTests();
  }

  // Disable button during processing
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Loading AI...';
  }

  try {
    // Initialize engine if needed
    if (!isEngineReady()) {
      showFeedback('<p class="loading-message">Initializing AI model... This may take a few minutes on first load.</p>');
      await initEngine(updateProgress);
    }

    // Update UI
    if (submitBtn) submitBtn.textContent = 'Analyzing...';
    showFeedback('<p class="loading-message">AI is reviewing your code...</p>');

    // Get AI feedback with "Interviewer" personality
    let streamedContent = '';
    const interviewerPrompt = `
      You are a senior engineering interviewer at a top tech company.
      Review this Two Sum solution.
      Be professional, encouraging, but also pointed about time/space complexity.
      If the solution is correct, acknowledge it and maybe ask about the Follow-up O(n) approach if they didn't use it.
      If it's incorrect or inefficient, guide them to the right path without giving away the full answer immediately.
      Format your response in a supportive, conversational tone.
    `;

    await evaluateCode(
      `${interviewerPrompt}\n\nProblem: ${PROBLEM_DESCRIPTION}`,
      code,
      testResults,
      (token, fullText) => {
        streamedContent = fullText;
        showFeedback(formatMarkdown(streamedContent), true);
      }
    );

    // Final formatted output
    showFeedback(`<div class="ai-response">${formatMarkdown(streamedContent)}</div>`);

  } catch (error) {
    console.error('Error during AI review:', error);
    showFeedback(`<div class="feedback-error">
      <p><strong>Error</strong></p>
      <p>${error.message}</p>
    </div>`);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit for Review';
    }

    // Hide progress
    const progressContainer = document.getElementById('progress-container');
    if (progressContainer) progressContainer.style.display = 'none';
  }
}

/**
 * Handle Get Hint button click
 */
async function handleGetHint() {
  const hintBtn = document.getElementById('get-hint');
  const code = getEditorCode();

  // Check WebGPU support
  const gpuCheck = checkWebGPUSupport();
  if (!gpuCheck.supported) {
    showFeedback(`<div class="feedback-error">
      <p><strong>WebGPU Not Supported</strong></p>
      <p>${gpuCheck.message}</p>
    </div>`);
    return;
  }

  if (hintBtn) {
    hintBtn.disabled = true;
    hintBtn.textContent = 'Loading...';
  }

  try {
    // Initialize engine if needed
    if (!isEngineReady()) {
      showFeedback('<p class="loading-message">Initializing AI model for hints...</p>');
      await initEngine(updateProgress);
    }

    showFeedback('<p class="loading-message">Getting hint...</p>');

    // Get hint
    let streamedContent = '';
    await getHint(
      PROBLEM_DESCRIPTION,
      code,
      (token, fullText) => {
        streamedContent = fullText;
        showFeedback(`<div class="hint-response">${formatMarkdown(streamedContent)}</div>`, true);
      }
    );

  } catch (error) {
    console.error('Error getting hint:', error);
    showFeedback(`<div class="feedback-error">
      <p><strong>Error</strong></p>
      <p>${error.message}</p>
    </div>`);
  } finally {
    if (hintBtn) {
      hintBtn.disabled = false;
      hintBtn.textContent = 'Hint';
    }

    const progressContainer = document.getElementById('progress-container');
    if (progressContainer) progressContainer.style.display = 'none';
  }
}

/**
 * Basic markdown to HTML conversion
 */
function formatMarkdown(text) {
  if (!text) return '';

  return text
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Line breaks
    .replace(/\n/g, '<br>');
}

/**
 * Initialize the interview UI
 */
function init() {
  // Initialize editor
  initEditor();

  // Bind event handlers
  const runTestsBtn = document.getElementById('run-tests');
  const submitBtn = document.getElementById('submit-solution');
  const hintBtn = document.getElementById('get-hint');

  if (runTestsBtn) {
    runTestsBtn.addEventListener('click', handleRunTests);
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', handleSubmitForReview);
  }

  if (hintBtn) {
    hintBtn.addEventListener('click', handleGetHint);
  }

  // Check WebGPU support on load
  const gpuCheck = checkWebGPUSupport();
  if (!gpuCheck.supported) {
    const statusText = document.querySelector('.status-text');
    if (statusText) {
      statusText.innerHTML = `<span class="warning">${gpuCheck.message}</span> You can still run tests locally.`;
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export default { init };
