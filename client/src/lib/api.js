const getApiUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
  const normalizedUrl = configuredUrl.replace(/\/$/, '');

  if (normalizedUrl.includes('<') || normalizedUrl.includes('>') || normalizedUrl.includes('your-render')) {
    throw new Error('Backend API URL is not configured. Set VITE_API_URL to your real Render URL.');
  }

  return normalizedUrl;
};

const API_URL = getApiUrl();

const buildHeaders = (token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.message || 'Request failed';
    throw new Error(message);
  }
  return data;
};

export const api = {
  async get(path, token) {
    const res = await fetch(`${API_URL}${path}`, {
      headers: buildHeaders(token),
    });
    return handleResponse(res);
  },
  async post(path, body, token) {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: buildHeaders(token),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },
  async postForm(path, formData, token) {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return handleResponse(res);
  },
  async patch(path, body, token) {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'PATCH',
      headers: buildHeaders(token),
      body: JSON.stringify(body),
    });
    return handleResponse(res);
  },
  async delete(path, token) {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'DELETE',
      headers: buildHeaders(token),
    });
    return handleResponse(res);
  },
};
