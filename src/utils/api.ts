const BASE_URL = 'https://quiz-backend-ten-orpin.vercel.app/api';

// Helper to get headers with dynamic Authorization token
function getHeaders(token?: string | null) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const activeToken = token || localStorage.getItem('qm_token');
  if (activeToken) {
    headers['Authorization'] = `Bearer ${activeToken}`;
  }
  return headers;
}

// Helper to check and parse standard JSON responses
async function handleResponse(response: Response) {
  if (!response.ok) {
    let message = 'An error occurred during the API request.';
    try {
      const errorData = await response.json();
      message = errorData.message || message;
    } catch (_) { }
    throw new Error(message);
  }
  return response.json();
}

export const api = {
  // Auth API
  async login(email: string, pass: string) {
    const res = await fetch(`${BASE_URL}/profile/login`, {
      method: 'POST',
      headers: getHeaders(null),
      body: JSON.stringify({ email, password: pass })
    });
    return handleResponse(res);
  },

  // Users & Profiles API
  async getUsers(token?: string | null) {
    const res = await fetch(`${BASE_URL}/profile`, {
      method: 'GET',
      headers: getHeaders(token)
    });
    return handleResponse(res);
  },

  async getProfile(id: string, token?: string | null) {
    const res = await fetch(`${BASE_URL}/profile/${id}`, {
      method: 'GET',
      headers: getHeaders(token)
    });
    return handleResponse(res);
  },

  async updateProfile(id: string, payload: any, token?: string | null) {
    const res = await fetch(`${BASE_URL}/profile/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async adjustUserStats(userId: string, totalPoints: number, streak: number, level?: number, token?: string | null) {
    const res = await fetch(`${BASE_URL}/profile/adjust-stats/${userId}`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ totalPoints, streak, level })
    });
    return handleResponse(res);
  },

  // Questions API
  async getQuestions(category?: string, isCustom?: boolean, token?: string | null) {
    let url = `${BASE_URL}/questions`;
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (isCustom !== undefined) params.append('isCustom', String(isCustom));
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders(token)
    });
    return handleResponse(res);
  },

  async saveQuestion(payload: any, token?: string | null) {
    const isEdit = !!payload.id;
    const url = isEdit ? `${BASE_URL}/questions/${payload.id}` : `${BASE_URL}/questions`;
    const method = isEdit ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async deleteQuestion(id: string, token?: string | null) {
    const res = await fetch(`${BASE_URL}/questions/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token)
    });
    return handleResponse(res);
  },

  async toggleFavorite(id: string, token?: string | null) {
    const res = await fetch(`${BASE_URL}/questions/${id}/favorite`, {
      method: 'POST',
      headers: getHeaders(token)
    });
    return handleResponse(res);
  },

  async bulkImport(questions: any[], token?: string | null) {
    const res = await fetch(`${BASE_URL}/questions/import`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(questions)
    });
    return handleResponse(res);
  },

  // Categories API
  async getCategories(token?: string | null) {
    const res = await fetch(`${BASE_URL}/categories`, {
      method: 'GET',
      headers: getHeaders(token)
    });
    return handleResponse(res);
  },

  async saveCategoryOperation(oldName: string, newName: string, mode: 'rename' | 'duplicate' | 'delete', token?: string | null) {
    const res = await fetch(`${BASE_URL}/categories/operation`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ oldName, newName, mode })
    });
    return handleResponse(res);
  },

  // Results API
  async getResults(token?: string | null) {
    const res = await fetch(`${BASE_URL}/results`, {
      method: 'GET',
      headers: getHeaders(token)
    });
    return handleResponse(res);
  },

  async getUserResults(userId: string, token?: string | null) {
    const res = await fetch(`${BASE_URL}/results/user/${userId}`, {
      method: 'GET',
      headers: getHeaders(token)
    });
    return handleResponse(res);
  },

  async submitQuizResult(payload: any, token?: string | null) {
    const res = await fetch(`${BASE_URL}/results`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  // Leaderboard API
  async getLeaderboardWeekly(token?: string | null) {
    const res = await fetch(`${BASE_URL}/leaderboard/weekly`, {
      method: 'GET',
      headers: getHeaders(token)
    });
    return handleResponse(res);
  },

  async getLeaderboardAllTime(token?: string | null) {
    const res = await fetch(`${BASE_URL}/leaderboard/alltime`, {
      method: 'GET',
      headers: getHeaders(token)
    });
    return handleResponse(res);
  },

  async getDashboardStats(token?: string | null) {
    const res = await fetch(`${BASE_URL}/analytics/dashboard`, {
      method: 'GET',
      headers: getHeaders(token)
    });
    return handleResponse(res);
  },

  async clearQuestions(category?: string, token?: string | null) {
    let url = `${BASE_URL}/questions`;
    if (category) {
      url += `?category=${encodeURIComponent(category)}`;
    }
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getHeaders(token)
    });
    return handleResponse(res);
  }
};
