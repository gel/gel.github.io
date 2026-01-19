// WebLLM Engine for Live Interview Feature
// Uses @mlc-ai/web-llm via CDN

let engine = null;
let isLoading = false;

const MODEL_ID = "Llama-3.2-1B-Instruct-q4f32_1-MLC";

const SYSTEM_PROMPT = `You are an experienced technical interviewer at a top tech company.
You are conducting a coding interview for a programming problem.

Your role:
1. Evaluate the candidate's solution for correctness, efficiency, and code quality
2. Ask follow-up questions like a real interviewer would
3. Provide constructive feedback on their approach
4. If the solution is incorrect, guide them without giving away the answer
5. Discuss time and space complexity

Respond as if you're in a live interview. Be encouraging but rigorous.`;

/**
 * Check if WebGPU is available
 */
export function checkWebGPUSupport() {
  if (!navigator.gpu) {
    return {
      supported: false,
      message: "WebGPU not supported. Please use Chrome 113+ or Edge 113+."
    };
  }
  return { supported: true };
}

/**
 * Initialize the WebLLM engine with progress callback
 * @param {function} onProgress - Progress callback (progress: number, text: string)
 */
export async function initEngine(onProgress) {
  if (engine) return engine;
  if (isLoading) {
    throw new Error("Engine is already loading");
  }

  const gpuCheck = checkWebGPUSupport();
  if (!gpuCheck.supported) {
    throw new Error(gpuCheck.message);
  }

  isLoading = true;

  try {
    // Dynamic import of WebLLM from CDN (esm.run works better for browser)
    const { CreateMLCEngine } = await import(
      "https://esm.run/@mlc-ai/web-llm"
    );

    engine = await CreateMLCEngine(MODEL_ID, {
      initProgressCallback: (report) => {
        if (onProgress) {
          onProgress(report.progress, report.text);
        }
      }
    });

    isLoading = false;
    return engine;
  } catch (error) {
    isLoading = false;
    throw error;
  }
}

/**
 * Get the current engine instance
 */
export function getEngine() {
  return engine;
}

/**
 * Check if engine is ready
 */
export function isEngineReady() {
  return engine !== null;
}

/**
 * Check if engine is currently loading
 */
export function isEngineLoading() {
  return isLoading;
}

/**
 * Evaluate user code with LLM feedback
 * @param {string} problemDescription - The problem description
 * @param {string} userCode - The user's submitted code
 * @param {object} testResults - Results from running test cases
 * @param {function} onToken - Callback for streaming tokens
 */
export async function evaluateCode(problemDescription, userCode, testResults, onToken) {
  if (!engine) {
    throw new Error("Engine not initialized. Call initEngine first.");
  }

  const testResultsSummary = testResults.map((r, i) => {
    if (r.error) {
      return `Test ${i + 1}: ERROR - ${r.error}`;
    }
    return `Test ${i + 1}: ${r.passed ? "PASSED" : "FAILED"} - Input: ${JSON.stringify(r.input)}, Expected: ${JSON.stringify(r.expected)}, Got: ${JSON.stringify(r.actual)}`;
  }).join("\n");

  const userMessage = `Problem: ${problemDescription}

Here's my solution:
\`\`\`javascript
${userCode}
\`\`\`

Test Results:
${testResultsSummary}

Please provide your feedback as a technical interviewer.`;

  try {
    const response = await engine.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
      stream: true
    });

    let fullResponse = "";

    for await (const chunk of response) {
      const delta = chunk.choices[0]?.delta?.content || "";
      fullResponse += delta;
      if (onToken) {
        onToken(delta, fullResponse);
      }
    }

    return fullResponse;
  } catch (error) {
    console.error("Error during LLM evaluation:", error);
    throw error;
  }
}

/**
 * Get a hint for the problem
 * @param {string} problemDescription - The problem description
 * @param {string} userCode - The user's current code (may be empty)
 * @param {function} onToken - Callback for streaming tokens
 */
export async function getHint(problemDescription, userCode, onToken) {
  if (!engine) {
    throw new Error("Engine not initialized. Call initEngine first.");
  }

  const hintPrompt = `You are a helpful interviewer. The candidate is working on this problem:

${problemDescription}

${userCode ? `Their current code:\n\`\`\`javascript\n${userCode}\n\`\`\`` : "They haven't written any code yet."}

Give them a helpful hint to guide them toward the solution WITHOUT giving away the answer. Be brief and encouraging.`;

  try {
    const response = await engine.chat.completions.create({
      messages: [
        { role: "user", content: hintPrompt }
      ],
      temperature: 0.7,
      stream: true
    });

    let fullResponse = "";

    for await (const chunk of response) {
      const delta = chunk.choices[0]?.delta?.content || "";
      fullResponse += delta;
      if (onToken) {
        onToken(delta, fullResponse);
      }
    }

    return fullResponse;
  } catch (error) {
    console.error("Error getting hint:", error);
    throw error;
  }
}

/**
 * Generate code based on user prompt
 * @param {string} prompt - The user's instruction
 * @param {string} currentCode - The current code in editor
 * @param {function} onToken - Callback for streaming tokens
 */
export async function generateCode(prompt, currentCode, onToken) {
  if (!engine) {
    throw new Error("Engine not initialized. Call initEngine first.");
  }

  const systemPrompt = `You are an expert coding assistant.
Your task is to modify the provided code based on the user's request.
Return ONLY the full updated code. Do not include markdown formatting, backticks, or explanations.
Just the raw code.`;

  const userMessage = `Current Code:
${currentCode}

Request: ${prompt}

Return the full updated code:`;

  try {
    const response = await engine.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.1, // Lower temperature for more deterministic code generation
      stream: true
    });

    let fullResponse = "";

    for await (const chunk of response) {
      const delta = chunk.choices[0]?.delta?.content || "";
      fullResponse += delta;
      if (onToken) {
        onToken(delta, fullResponse);
      }
    }

    // cleanup response (remove potential markdown blocks if the model ignored instructions)
    let cleanCode = fullResponse;
    if (cleanCode.includes("```")) {
      cleanCode = cleanCode.replace(/```\w*\n?/g, "").replace(/```/g, "");
    }
    return cleanCode.trim();

  } catch (error) {
    console.error("Error generating code:", error);
    throw error;
  }
}

export default {
  checkWebGPUSupport,
  initEngine,
  getEngine,
  isEngineReady,
  isEngineLoading,
  evaluateCode,
  getHint,
  generateCode
};
