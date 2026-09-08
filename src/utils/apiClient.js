const API_BASE_URL = String(import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const REQUEST_TIMEOUT_MS = 8000;
const MAX_RETRIES = 2;

const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

export async function requestJson(path, options = {}) {
  const { retries = MAX_RETRIES, ...requestOptions } = options;
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...requestOptions,
        headers: { Accept: 'application/json', ...(requestOptions.body ? { 'Content-Type': 'application/json' } : {}), ...(requestOptions.headers || {}) },
        signal: controller.signal,
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || `API request failed (${response.status})`);
      return body;
    } catch (error) {
      lastError = error;
      if (attempt < retries) await wait(350 * (attempt + 1));
    } finally {
      window.clearTimeout(timeout);
    }
  }

  throw lastError || new Error('API request failed');
}

export const getApiState = () => requestJson('/api/state');

export const putApiState = (state) => requestJson('/api/state', {
  method: 'PUT',
  body: JSON.stringify(state),
});
