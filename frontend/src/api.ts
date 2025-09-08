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

export async function getGames(): Promise<string[]> {
  const res = await axios.get("/games");
  return res.data;
}

export async function getPlans(username: string): Promise<string[]> {
  const res = await axios.get(`/${encodeURIComponent(username)}/plans`);
  return res.data;
}

export async function createPlan(username: string, gameName: string): Promise<any> {
  const res = await axios.post(`/${encodeURIComponent(username)}/plans/${encodeURIComponent(gameName)}`);
  return res.data;
}
