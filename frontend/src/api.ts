import axios from "axios";

const API_BASE = "/users";

export async function signUpUser(username: string): Promise<void> {
  // POST /users/{username}
  await axios.post(`${API_BASE}/${encodeURIComponent(username)}`);
}

export async function loginUser(username: string): Promise<void> {
  // GET /users/{username}
  await axios.get(`${API_BASE}/${encodeURIComponent(username)}`);
}
