// Interview UI - Main entry point for Live Interview feature
import { runTests, formatResultsHTML, getTestSummary } from './code-runner.js';
import {
  initEngine,
  isEngineReady,
  isEngineLoading,
  evaluateCode,
  getHint,
  generateCode,
  checkWebGPUSupport
} from './webllm-engine.js';

// Get current problem config from window (injected by Hugo template)
const currentProblem = window.problemConfig;

// Enrich with description from DOM if available
if (currentProblem) {
  const descriptionEl = document.querySelector('.problem-description');
  if (descriptionEl) {
    // Use the full text content as the description for the AI
    currentProblem.description = descriptionEl.innerText.trim();
  } else {
    currentProblem.description = "No description available.";
  }
} else {
  console.error("[Interview] No problem configuration found. Make sure front matter is correct.");
}

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

  // Find the scrollable container (the .page element)
  const scrollContainer = document.querySelector('.page');
  
  // Check if we should auto-scroll BEFORE updating content
  // We should scroll if the user is already near the bottom (within 100px)
  let shouldAutoScroll = false;
  
  if (isStreaming && scrollContainer) {
    const distanceToBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight;
    // If distance is small, user is at the bottom. If large, they scrolled up.
    shouldAutoScroll = distanceToBottom < 150;
  } else if (!isStreaming) {
    // Always scroll for final results/messages
    shouldAutoScroll = true;
  }

  if (isStreaming) {
    feedbackContent.innerHTML = `<div class="streaming-response">${content}</div>`;
    
    // Only scroll if we were already at the bottom
    if (shouldAutoScroll) {
      feedbackContent.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  } else {
    feedbackContent.innerHTML = content;
    
    // Auto-scroll to feedback section when new message appears (loading, result, etc)
    const container = feedbackContent.closest('.ai-feedback');
    if (container && shouldAutoScroll) {
      container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
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

/**
 * Handle AI Code Assistant submission
 */
async function handleCodeAssist() {
  const input = document.getElementById('ai-code-prompt');
  const btn = document.getElementById('ai-code-submit');
  const prompt = input ? input.value.trim() : '';

  if (!prompt || !input || !btn) return;

  const currentCode = getEditorCode();
  
  // Disable UI
  input.disabled = true;
  btn.disabled = true;
  const originalBtnText = btn.innerHTML;
  btn.innerHTML = '<span>⏳</span>'; // Loading hourglass

  try {
    // Initialize engine if needed
    if (!isEngineReady()) {
      showFeedback('<p class="loading-message">Initializing AI model for code generation...</p>');
      await initEngine(updateProgress);
    }

    // Generate code
    const newCode = await generateCode(
      prompt, 
      currentCode,
      null // We don't need to stream to a separate view, just wait for final result
    );

    // Update editor
    if (editor && newCode) {
      editor.setValue(newCode);
      // Format document if possible
      editor.getAction('editor.action.formatDocument').run();
    }
    
    // Clear input on success
    input.value = '';

  } catch (error) {
    console.error('Error generating code:', error);
    showFeedback(`<div class="feedback-error">
      <p><strong>Code Generation Error</strong></p>
      <p>${error.message}</p>
    </div>`);
  } finally {
    // Re-enable UI
    input.disabled = false;
    btn.disabled = false;
    btn.innerHTML = originalBtnText;
    input.focus();
    
    // Hide progress if it was shown
    const progressContainer = document.getElementById('progress-container');
    if (progressContainer) progressContainer.style.display = 'none';
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Add event listeners for new widget after init
document.addEventListener('DOMContentLoaded', () => {
  const aiCodeInput = document.getElementById('ai-code-prompt');
  const aiCodeSubmit = document.getElementById('ai-code-submit');
  
  if (aiCodeSubmit) {
    aiCodeSubmit.addEventListener('click', handleCodeAssist);
  }
  
  if (aiCodeInput) {
    aiCodeInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleCodeAssist();
      }
    });
  }
});

export default { init };
