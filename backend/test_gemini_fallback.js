/**
 * ADMIFY GEMINI MULTI-MODEL FALLBACK SUITE
 *
 * Verifies robust service-boundary fallback behavior:
 * - Test A: Primary model succeeds -> primary model used
 * - Test B: Primary model fails -> second model attempted & succeeds
 * - Test C: First two models fail -> next configured fallback attempted & succeeds
 * - Test D: All configured models fail -> clean controlled AI error returned
 * - Test E: Fallback success returns genuine AI content
 * - Test F: No API key leak in logs, errors, or returns
 */

import {
  callGeminiWithFallback,
  setAIClientForTesting,
  resetAIClient,
  GEMINI_MODELS,
  generateChatResponse,
} from './services/geminiService.js';

const results = [];
function record(testId, name, status, details = '') {
  results.push({ testId, name, status, details });
  const sym = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${sym} [${testId}] ${name} -> [${status}] ${details ? '(' + details + ')' : ''}`);
}

async function runGeminiFallbackTests() {
  console.log('========================================================================');
  console.log('            ADMIFY GEMINI 4-MODEL FALLBACK VERIFICATION SUITE           ');
  console.log('========================================================================\n');

  try {
    // ─────────────────────────────────────────────────────────────
    // TEST A: Primary model succeeds -> primary used
    // ─────────────────────────────────────────────────────────────
    const callLogA = [];
    const mockClientA = {
      models: {
        generateContent: async ({ model, contents }) => {
          callLogA.push(model);
          if (model === GEMINI_MODELS[0]) {
            return { text: `Generated response from primary model ${model}` };
          }
          throw new Error(`Unexpected model called: ${model}`);
        },
      },
    };

    setAIClientForTesting(mockClientA);
    const respA = await callGeminiWithFallback('Test prompt A');
    const passA = callLogA.length === 1 && callLogA[0] === GEMINI_MODELS[0] && respA.includes('primary model');
    record('Test A', 'Primary model succeeds -> primary used immediately', passA ? 'PASS' : 'FAIL', `Calls: ${callLogA.join(', ')}`);

    // ─────────────────────────────────────────────────────────────
    // TEST B: Primary model fails -> second model attempted
    // ─────────────────────────────────────────────────────────────
    const callLogB = [];
    const mockClientB = {
      models: {
        generateContent: async ({ model, contents }) => {
          callLogB.push(model);
          if (model === GEMINI_MODELS[0]) {
            const err = new Error('503 Service Unavailable on primary model');
            err.status = 503;
            throw err;
          }
          if (model === GEMINI_MODELS[1]) {
            return { text: `Success on fallback tier 1: ${model}` };
          }
          throw new Error('Should not reach here');
        },
      },
    };

    setAIClientForTesting(mockClientB);
    const respB = await callGeminiWithFallback('Test prompt B');
    const passB = callLogB.length === 2 &&
      callLogB[0] === GEMINI_MODELS[0] &&
      callLogB[1] === GEMINI_MODELS[1] &&
      respB.includes('fallback tier 1');
    record('Test B', 'Primary model fails (503) -> second model attempted & succeeds', passB ? 'PASS' : 'FAIL', `Chain: ${callLogB.join(' -> ')}`);

    // ─────────────────────────────────────────────────────────────
    // TEST C: First two fail -> next configured fallback attempted
    // ─────────────────────────────────────────────────────────────
    const callLogC = [];
    const mockClientC = {
      models: {
        generateContent: async ({ model, contents }) => {
          callLogC.push(model);
          if (model === GEMINI_MODELS[0]) {
            const err = new Error('404 Model Not Found');
            err.status = 404;
            throw err;
          }
          if (model === GEMINI_MODELS[1]) {
            const err = new Error('429 Rate Limit Exceeded');
            err.status = 429;
            throw err;
          }
          if (model === GEMINI_MODELS[2]) {
            return { text: `Success on tier 2 fallback: ${model}` };
          }
          throw new Error('Should not reach model 3');
        },
      },
    };

    setAIClientForTesting(mockClientC);
    const respC = await callGeminiWithFallback('Test prompt C');
    const passC = callLogC.length === 3 &&
      callLogC[0] === GEMINI_MODELS[0] &&
      callLogC[1] === GEMINI_MODELS[1] &&
      callLogC[2] === GEMINI_MODELS[2] &&
      respC.includes('tier 2 fallback');
    record('Test C', 'First two fail (404, 429) -> next configured fallback attempted & succeeds', passC ? 'PASS' : 'FAIL', `Chain: ${callLogC.join(' -> ')}`);

    // ─────────────────────────────────────────────────────────────
    // TEST D: All configured models fail -> clean controlled AI error returned
    // ─────────────────────────────────────────────────────────────
    const callLogD = [];
    const mockClientD = {
      models: {
        generateContent: async ({ model }) => {
          callLogD.push(model);
          const err = new Error(`All down: ${model}`);
          err.status = 503;
          throw err;
        },
      },
    };

    setAIClientForTesting(mockClientD);
    const respD = await callGeminiWithFallback('Test prompt D');
    const chatRespD = await generateChatResponse({ prompt: 'How do I apply?' });
    const passD = respD === null &&
      callLogD.length >= GEMINI_MODELS.length &&
      typeof chatRespD === 'string' &&
      chatRespD.includes('temporarily unable') &&
      chatRespD.includes('Live Agent');
    record('Test D', 'All configured models fail -> clean controlled AI error returned', passD ? 'PASS' : 'FAIL', `Exhausted ${callLogD.length} models without crash`);

    // ─────────────────────────────────────────────────────────────
    // TEST E: Fallback success still returns a valid Gemini response
    // ─────────────────────────────────────────────────────────────
    const mockClientE = {
      models: {
        generateContent: async ({ model }) => {
          if (model === GEMINI_MODELS[0]) {
            const err = new Error('Temporary outage');
            err.status = 500;
            throw err;
          }
          return { text: 'Oxford University requires minimum 3.8 GPA and 7.5 IELTS for MSc Computer Science.' };
        },
      },
    };

    setAIClientForTesting(mockClientE);
    const respE = await generateChatResponse({ prompt: 'Tell me about Oxford requirements' });
    const passE = typeof respE === 'string' && respE.includes('Oxford University requires minimum 3.8 GPA');
    record('Test E', 'Fallback success returns authentic AI response to client', passE ? 'PASS' : 'FAIL', `Received valid content: "${respE.slice(0, 45)}..."`);

    // ─────────────────────────────────────────────────────────────
    // TEST F: No API key leak in errors
    // ─────────────────────────────────────────────────────────────
    const fakeSecret = 'AIzaSyA1234567890abcdefghijklmnopqrstuv';
    const logCapture = [];
    const originalWarn = console.warn;
    const originalError = console.error;
    console.warn = (...args) => logCapture.push(args.join(' '));
    console.error = (...args) => logCapture.push(args.join(' '));

    const mockClientF = {
      models: {
        generateContent: async () => {
          throw new Error(`Failed to authenticate with key ${fakeSecret} at remote endpoint`);
        },
      },
    };

    setAIClientForTesting(mockClientF);
    const respF = await callGeminiWithFallback('Test prompt F');

    console.warn = originalWarn;
    console.error = originalError;

    const leakedInLogs = logCapture.some(l => l.includes(fakeSecret));
    const leakedInReturn = typeof respF === 'string' && respF.includes(fakeSecret);
    const passF = !leakedInLogs && !leakedInReturn;
    record('Test F', 'No API key leak in errors, logs, or return values', passF ? 'PASS' : 'FAIL', leakedInLogs ? 'KEY LEAKED' : 'Redaction verified');

    // Restore real client
    resetAIClient();

    console.log('\n========================================================================');
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    console.log(`GEMINI FALLBACK TEST RESULTS: ${passed}/${results.length} PASSED (${failed} FAILED)`);
    console.log('========================================================================\n');

    if (failed > 0) process.exit(1);
    process.exit(0);
  } catch (err) {
    console.error('Gemini fallback test runner encountered unexpected error:', err);
    resetAIClient();
    process.exit(1);
  }
}

runGeminiFallbackTests();
