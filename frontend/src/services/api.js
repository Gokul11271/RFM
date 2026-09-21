const API_BASE = '/api';

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function uploadFilePreview(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/rfm/upload-preview`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to parse file preview');
  }

  return res.json();
}

export async function analyzeDataset(file, mapping, apiKey = null) {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }
  formData.append('mapping_json', JSON.stringify(mapping));
  if (apiKey) {
    formData.append('api_key', apiKey);
  }

  const res = await fetch(`${API_BASE}/rfm/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'RFM Analysis failed');
  }

  return res.json();
}

export async function loadSampleAnalysis(apiKey = null) {
  let url = `${API_BASE}/rfm/sample`;
  if (apiKey) {
    url += `?api_key=${encodeURIComponent(apiKey)}`;
  }

  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to load sample dataset');
  }

  return res.json();
}

export async function loadSampleSaasAnalysis(apiKey = null) {
  let url = `${API_BASE}/rfm/sample-saas`;
  if (apiKey) {
    url += `?api_key=${encodeURIComponent(apiKey)}`;
  }

  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to load SaaS sample dataset');
  }

  return res.json();
}

export async function fetchSampleDatasets() {
  const res = await fetch(`${API_BASE}/rfm/datasets`);
  if (!res.ok) {
    return [];
  }
  return res.json();
}

export async function askAiAssistant(question, rfmContext, apiKey = null, llmProvider = 'gemini') {
  const res = await fetch(`${API_BASE}/rfm/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question,
      rfm_context: rfmContext,
      api_key: apiKey,
      llm_provider: llmProvider,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Chat query failed');
  }

  return res.json();
}
