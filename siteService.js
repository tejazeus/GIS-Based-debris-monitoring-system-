import { SAMPLE_SITES } from "../data/sampleSites";

// ---------------------------------------------------------------------
// Data layer. Every UI component talks to this file, never to
// localStorage or sample data directly. To move to a real backend
// (Firebase, Supabase, PostgreSQL/PostGIS, a REST API, ...) reimplement
// the functions below with the same signatures — nothing above this
// file needs to change.
// ---------------------------------------------------------------------

const STORAGE_KEY = "campus-gis-monitor:sites";
const SIMULATED_LATENCY_MS = 120;

function delay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_LATENCY_MS));
}

function loadFromStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function saveToStorage(sites) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sites));
  } catch {
    // Storage can fail (quota, private mode). Non-fatal for this prototype.
  }
}

function seedIfNeeded() {
  const existing = loadFromStorage();
  if (existing) return existing;
  saveToStorage(SAMPLE_SITES);
  return SAMPLE_SITES;
}

let cache = seedIfNeeded();

function nextId() {
  const nums = cache
    .map((s) => parseInt(String(s.id).replace(/\D/g, ""), 10))
    .filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `SITE-${String(max + 1).padStart(3, "0")}`;
}

export async function getSites() {
  return delay([...cache]);
}

export async function getSiteById(id) {
  const site = cache.find((s) => s.id === id) || null;
  return delay(site);
}

export async function createSite(site) {
  const record = {
    status: "pending",
    severity: "medium",
    photos: [],
    video: null,
    modelUrl: null,
    reportedAt: new Date().toISOString(),
    ...site,
    id: site.id || nextId(),
  };
  cache = [record, ...cache];
  saveToStorage(cache);
  return delay(record);
}

export async function updateSite(id, data) {
  let updated = null;
  cache = cache.map((s) => {
    if (s.id !== id) return s;
    updated = { ...s, ...data, id: s.id };
    return updated;
  });
  saveToStorage(cache);
  return delay(updated);
}

export async function deleteSite(id) {
  cache = cache.filter((s) => s.id !== id);
  saveToStorage(cache);
  return delay(true);
}

export async function resetToSampleData() {
  cache = SAMPLE_SITES;
  saveToStorage(cache);
  return delay([...cache]);
}
