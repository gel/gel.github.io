// WebLLM Engine for Live Interview Feature
// Uses @mlc-ai/web-llm via CDN

let engine = null;
let isLoading = false;

const MODEL_ID = "Llama-3.2-1B-Instruct-q4f32_1-MLC";

const SYSTEM_PROMPT = `You are an experienced technical interviewer at a top tech company.
You are conducting a coding interview with me (the candidate).

Your role:
1. Evaluate my solution for correctness, efficiency, and code quality.
2. Ask me follow-up questions like a real interviewer would.
3. Provide constructive feedback on my approach.
4. If the solution is incorrect, guide me without giving away the answer.
5. Discuss time and space complexity with me.

Important: Speak directly to me in the first person (e.g., "I see you used a loop...", "How would you optimize this?"). Do not refer to "the candidate" or "the user". Be encouraging but rigorous.`;

// ...

  const userMessage = `Problem: ${problemDescription}

I have submitted this solution:
\`\`\`javascript
${userCode}
\`\`\`

Test Results:
${testResultsSummary}

Please review my code and provide feedback.`;

// ...

  const hintPrompt = `You are a helpful interviewer. I (the candidate) am working on this problem:

${problemDescription}

${userCode ? `My current code is:\n\`\`\`javascript\n${userCode}\n\`\`\`` : "I haven't written any code yet."}

Please give me a helpful hint to guide me toward the solution WITHOUT giving away the answer. Address me directly as "you". Be brief and encouraging.`;

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
