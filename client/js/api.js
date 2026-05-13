/* ── Foodie AI — HTTP API client ──────────────────────────────────────── */
const BASE = '/api';

function token() {
  return localStorage.getItem('foodie_token');
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const t = token();
  if (t) headers['Authorization'] = `Bearer ${t}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

const get  = (path)        => request('GET',    path);
const post = (path, body)  => request('POST',   path, body);
const put  = (path, body)  => request('PUT',    path, body);
const del  = (path)        => request('DELETE', path);
const patch = (path, body) => request('PATCH',  path, body);

window.API = {
  auth: {
    register: (body) => post('/auth/register', body),
    login:    (body) => post('/auth/login',    body),
  },
  recipes: {
    list:           (params = {}) => get('/recipes?' + new URLSearchParams(params)),
    get:            (id)          => get(`/recipes/${id}`),
    save:           (body)        => post('/recipes', body),
    toggleFavorite: (id)          => patch(`/recipes/${id}/favorite`),
    delete:         (id)          => del(`/recipes/${id}`),
  },
  ai: {
    generate:  (body) => post('/ai/generate',  body),
    scan:      (body) => post('/ai/scan',       body),
    mealPlan:  ()     => post('/ai/meal-plan',  {}),
    tip:       (body) => post('/ai/tip',        body),
  },
  users: {
    profile:       ()     => get('/users/profile'),
    updateProfile: (body) => put('/users/profile', body),
    mealPlans:     ()     => get('/users/meal-plans'),
  },
};
