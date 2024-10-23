// api.ts
const api = process.env.NEXT_PUBLIC_API_URL;

export async function loginUser(username: string, password: string) {
  const res = await fetch(`${api}/token/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || 'Login failed. Please check your credentials.');
  }

  return res.json();
}
