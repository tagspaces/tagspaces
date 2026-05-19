/* Copyright (c) 2016-present - TagSpaces GmbH. All rights reserved. */

/**
 * Reusable Ollama HTTP mock for the AI generation e2e tests.
 *
 * The renderer talks to Ollama from the browser context via `ollama/browser`
 * (plain `fetch`): model listing hits `GET {host}/api/tags`, generation hits
 * `POST {host}/api/chat`. We intercept the configured mock host with Playwright
 * route() — same approach as update-check.pw.e2e.js — so the suite never needs
 * a real Ollama service and stays deterministic in CI.
 *
 * The mock host MUST match `url` in scripts/extconfig-ai-mock.js.
 */

const OLLAMA_HOST_PATTERN = '**/127.0.0.1:11434/**';

// The ollama lib sends `Content-Type: application/json`, which makes the
// cross-origin fetch non-simple → the browser fires a CORS preflight. Fulfil
// it (and tag every response with permissive CORS headers) or the real
// request never goes out and the route handler is never reached.
const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': '*',
};

function mockModel(name) {
  return {
    name,
    model: name,
    modified_at: new Date().toISOString(),
    size: 1,
    digest: 'e2e-mock-digest',
    details: {
      parent_model: '',
      format: 'gguf',
      family: 'llama',
      families: ['llama'],
      parameter_size: '1B',
      quantization_level: 'Q4_0',
    },
  };
}

function chatResponse(content) {
  return {
    model: 'llama3.2:latest',
    created_at: new Date().toISOString(),
    message: { role: 'assistant', content },
    done: true,
    done_reason: 'stop',
    total_duration: 1,
    load_duration: 1,
    prompt_eval_count: 1,
    prompt_eval_duration: 1,
    eval_count: 1,
    eval_duration: 1,
  };
}

/**
 * Arm the Ollama interceptor.
 *
 * @param capture mutable bucket — { tags, chat, requests } — updated in place
 *        so a test can assert how many calls the app actually made.
 * @param tags    the tag titles the mocked `/api/chat` returns (the renderer
 *        parses the assistant content as JSON and reads `.topics`).
 */
export async function armOllamaMock(
  capture = { tags: 0, chat: 0, requests: [] },
  tags = ['e2ealpha', 'e2ebeta', 'e2egamma'],
) {
  await global.client.route(OLLAMA_HOST_PATTERN, async (route) => {
    const request = route.request();
    const url = request.url();
    const method = request.method();
    capture.requests.push(method + ' ' + url);

    if (method === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: CORS_HEADERS, body: '' });
      return;
    }
    if (url.includes('/api/tags')) {
      capture.tags += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: CORS_HEADERS,
        body: JSON.stringify({
          models: [mockModel('llama3.2:latest'), mockModel('llava:latest')],
        }),
      });
      return;
    }
    if (url.includes('/api/chat')) {
      capture.chat += 1;
      // Tags mode parses the content as JSON and reads `.topics`. Returning
      // this for the model warm-up call too is harmless (that path ignores
      // the content).
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: CORS_HEADERS,
        body: JSON.stringify(chatResponse(JSON.stringify({ topics: tags }))),
      });
      return;
    }
    // Anything else the lib might probe — keep it 200 so nothing throws.
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: CORS_HEADERS,
      body: '{}',
    });
  });
  return capture;
}

export async function disarmOllamaMock() {
  await global.client.unroute(OLLAMA_HOST_PATTERN);
}

/**
 * Open the AI generation dialog from the grid perspective toolbar and wait
 * for it to render. Assumes a location is open and at least one entry is
 * selected (the toolbar AI button is hidden on read-only locations).
 */
export async function openAiGenerationDialog() {
  await global.client.click('[data-tid=gridPerspectiveAiGenTID]');
  await global.client.waitForSelector('[data-tid=startTagsGenTID]', {
    state: 'visible',
    timeout: 10000,
  });
}
