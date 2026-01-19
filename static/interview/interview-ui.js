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

// Problem configurations - detected from URL
const PROBLEMS = {
  'two-sum': {
    methodName: 'twoSum',
    description: 'Two Sum: Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    testCases: [
      { input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
      { input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
      { input: { nums: [3, 3], target: 6 }, expected: [0, 1] },
      { input: { nums: [1, 2, 3, 4, 5], target: 9 }, expected: [3, 4] },
      { input: { nums: [-1, -2, -3, -4, -5], target: -8 }, expected: [2, 4] }
    ],
    starterCode: `from typing import List

class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Brute force approach - check all pairs
        # TODO: Can you optimize this to O(n)?
        for i in range(len(nums)):
            for j in range(i + 1, len(nums)):
                if nums[i] + nums[j] == target:
                    return [i, j]
        return []`
  },

  'best-time-to-buy-sell-stock': {
    methodName: 'maxProfit',
    description: 'Best Time to Buy and Sell Stock: Given an array prices where prices[i] is the price of a stock on day i, find the maximum profit from buying and selling once.',
    testCases: [
      { input: { prices: [7, 1, 5, 3, 6, 4] }, expected: 5 },
      { input: { prices: [7, 6, 4, 3, 1] }, expected: 0 },
      { input: { prices: [1, 2, 3, 4, 5] }, expected: 4 },
      { input: { prices: [2, 4, 1] }, expected: 2 },
      { input: { prices: [3, 3, 3, 3] }, expected: 0 }
    ],
    starterCode: `from typing import List

class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        # Brute force - check all buy/sell combinations
        # TODO: Can you optimize this to O(n)?
        max_profit = 0
        for i in range(len(prices)):
            for j in range(i + 1, len(prices)):
                profit = prices[j] - prices[i]
                if profit > max_profit:
                    max_profit = profit
        return max_profit`
  },

  'longest-palindrome': {
    methodName: 'longestPalindrome',
    description: 'Longest Palindromic Substring: Given a string s, return the longest palindromic substring in s.',
    testCases: [
      { input: { s: 'babad' }, expected: 'bab' },  // or 'aba'
      { input: { s: 'cbbd' }, expected: 'bb' },
      { input: { s: 'a' }, expected: 'a' },
      { input: { s: 'ac' }, expected: 'a' },  // or 'c'
      { input: { s: 'racecar' }, expected: 'racecar' }
    ],
    starterCode: `class Solution:
    def longestPalindrome(self, s: str) -> str:
        # Brute force - check all substrings
        # TODO: Can you optimize this?
        def is_palindrome(sub):
            return sub == sub[::-1]

        longest = ""
        for i in range(len(s)):
            for j in range(i + 1, len(s) + 1):
                substring = s[i:j]
                if is_palindrome(substring) and len(substring) > len(longest):
                    longest = substring
        return longest`
  },

  'reverse-polish-notation': {
    methodName: 'evalRPN',
    description: 'Evaluate Reverse Polish Notation: Evaluate the value of an arithmetic expression in Reverse Polish Notation. Valid operators are +, -, *, /.',
    testCases: [
      { input: { tokens: ['2', '1', '+', '3', '*'] }, expected: 9 },
      { input: { tokens: ['4', '13', '5', '/', '+'] }, expected: 6 },
      { input: { tokens: ['10', '6', '9', '3', '+', '-11', '*', '/', '*', '17', '+', '5', '+'] }, expected: 22 },
      { input: { tokens: ['3', '4', '+'] }, expected: 7 },
      { input: { tokens: ['5', '2', '-'] }, expected: 3 }
    ],
    starterCode: `from typing import List

class Solution:
    def evalRPN(self, tokens: List[str]) -> int:
        # Use a stack to evaluate the expression
        stack = []

        for token in tokens:
            if token in ['+', '-', '*', '/']:
                # Pop two operands
                right = stack.pop()
                left = stack.pop()

                # Perform operation
                if token == '+':
                    result = left + right
                elif token == '-':
                    result = left - right
                elif token == '*':
                    result = left * right
                elif token == '/':
                    # Truncate toward zero
                    result = int(left / right)

                stack.append(result)
            else:
                stack.append(int(token))

        return stack[0]`
  }
};

// Detect current problem from URL
function getCurrentProblem() {
  const path = window.location.pathname;
  for (const problemId of Object.keys(PROBLEMS)) {
    if (path.includes(problemId)) {
      return PROBLEMS[problemId];
    }
  }
  // Default to two-sum if not found
  return PROBLEMS['two-sum'];
}

// Get current problem config
const currentProblem = getCurrentProblem();

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
    console.log('[Interview] Starter code length:', currentProblem.starterCode.length);

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
        value: currentProblem.starterCode,
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
  if (!editor) return currentProblem.starterCode;
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
    testResults = await runTests(code, currentProblem.testCases, currentProblem.methodName, updateProgress);
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

    const interviewerPrompt = `
      You are a senior engineering interviewer at a top tech company.
      Review this coding solution.
      Be professional, encouraging, but also pointed about time/space complexity.
      If the solution is correct, acknowledge it and maybe ask about optimization if they used a brute force approach.
      If it's incorrect or inefficient, guide them to the right path without giving away the full answer immediately.
      Format your response in a supportive, conversational tone.
    `;

    let streamedContent = '';
    await evaluateCode(
      `${interviewerPrompt}\n\nProblem: ${currentProblem.description}`,
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
      currentProblem.description,
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
