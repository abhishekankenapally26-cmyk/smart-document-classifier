const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export async function classifyDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/api/v1/classify`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Server error: ${response.status}`);
  }

  return response.json();
}

export async function getCategories() {
  const response = await fetch(`${API_URL}/api/v1/categories`);
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
}
