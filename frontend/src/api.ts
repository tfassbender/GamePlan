import axios from "axios";
import type { PlanDto } from "./types";

const USERS_ENDPOINT = "/users";
const GAMES_ENDPOINT = "/games";
const PLANS_SUB_PATH = "plans";

export async function signUpUser(username: string): Promise<void> {
  await axios.post(`${USERS_ENDPOINT}/${encodeURIComponent(username)}`);
}

export async function loginUser(username: string): Promise<void> {
  await axios.get(`${USERS_ENDPOINT}/${encodeURIComponent(username)}`);
}

export async function getGames(): Promise<string[]> {
  const res = await axios.get(GAMES_ENDPOINT);
  return res.data;
}

export async function getPlans(username: string): Promise<string[]> {
  const res = await axios.get(`${USERS_ENDPOINT}/${encodeURIComponent(username)}/${PLANS_SUB_PATH}`);
  return res.data;
}

export async function createPlan(username: string, gameName: string): Promise<any> {
  const res = await axios.post(`${USERS_ENDPOINT}/${encodeURIComponent(username)}/${PLANS_SUB_PATH}/${encodeURIComponent(gameName)}`);
  return res.data;
}

export async function fetchPlan(username: string, planName: string): Promise<PlanDto> {
  const response = await fetch(`${USERS_ENDPOINT}/${encodeURIComponent(username)}/${PLANS_SUB_PATH}/${encodeURIComponent(planName)}`);
  if (!response.ok) throw new Error("Failed to load plan");
  return response.json();
}

export async function updatePlan(username: string, plan: PlanDto): Promise<PlanDto> {
  const res = await axios.put(`${USERS_ENDPOINT}/${encodeURIComponent(username)}/${PLANS_SUB_PATH}`, plan);
  return res.data;
}

export async function clonePlan(username: string, originalPlanName: string): Promise<PlanDto> {
  const res = await axios.post(
    `${USERS_ENDPOINT}/${encodeURIComponent(username)}/${PLANS_SUB_PATH}`,
    { originalPlanName }
  );
  return res.data;
}

export async function deletePlan(username: string, planName: string): Promise<void> {
  await axios.delete(`${USERS_ENDPOINT}/${encodeURIComponent(username)}/${PLANS_SUB_PATH}/${encodeURIComponent(planName)}`);
}

export async function getVersion(): Promise<string> {
  const res = await fetch('/version');
  if (!res.ok) throw new Error('Failed to fetch version');
  const data = await res.json();
  return data.version;
}
