// Interview UI - Modular Architecture
import { runTests, formatResultsHTML } from './code-runner.js';
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

function getProblemConfig() {
  return window.problemConfig;
}

function getMonacoTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'vs-dark' : 'vs';
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
      const currentProblem = getProblemConfig();
      testResults = await runTests(
        code,
        currentProblem.testCases,
        currentProblem.methodName,
        currentProblem.typeMap || {}
      );
      resultsContainer.innerHTML = formatResultsHTML(testResults);
      resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (error) {
      resultsContainer.innerHTML = `<div class="test-error">Error running tests: ${error.message}</div>`;
    } finally {
      if (runBtn) { runBtn.disabled = false; runBtn.textContent = 'Run Tests'; }
    }
  },

  async handleSubmitForReview() {
    const submitBtn = document.getElementById('submit-solution');
    const code = getEditorCode();

    if (testResults.length === 0) this.handleRunTests();

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
