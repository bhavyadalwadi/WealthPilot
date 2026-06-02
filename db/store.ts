import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const storageDir = path.join(process.cwd(), "db", "storage");
const isVercelRuntime = process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV);

type StorageBackend = "file" | "kv";

export async function readJsonFile<T>(filename: string, fallback: T): Promise<T> {
  const backend = getStorageBackend();

  if (backend === "kv") {
    const raw = await readKvValue(filename);
    if (!raw) return fallback;

    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  try {
    await ensureStorageDir();
    const raw = await readFile(path.join(storageDir, filename), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonFile<T>(filename: string, data: T) {
  const serialized = JSON.stringify(data, null, 2);
  const backend = getStorageBackend();

  if (backend === "kv") {
    await writeKvValue(filename, serialized);
    return;
  }

  await ensureStorageDir();
  await writeFile(path.join(storageDir, filename), serialized, "utf8");
}

async function ensureStorageDir() {
  await mkdir(storageDir, { recursive: true });
}

function getStorageBackend(): StorageBackend {
  const strategy = process.env.STORAGE_DRIVER?.trim().toLowerCase();

  if (strategy === "file" || strategy === "kv") {
    return strategy;
  }

  return isVercelRuntime ? "kv" : "file";
}

async function readKvValue(key: string) {
  const result = await runKvCommand<string | null>(["GET", storageKey(key)]);
  return typeof result === "string" ? result : null;
}

async function writeKvValue(key: string, value: string) {
  await runKvCommand(["SET", storageKey(key), value]);
}

async function runKvCommand<T>(command: unknown[]): Promise<T> {
  const baseUrl = process.env.KV_REST_API_URL?.trim();
  const token = process.env.KV_REST_API_TOKEN?.trim();

  if (!baseUrl || !token) {
    throw new Error("KV_REST_API_URL and KV_REST_API_TOKEN are required when STORAGE_DRIVER resolves to kv.");
  }

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`KV command failed with ${response.status}.`);
  }

  const payload = (await response.json()) as { result?: T; error?: string };

  if (payload.error) {
    throw new Error(payload.error);
  }

  return payload.result as T;
}

function storageKey(filename: string) {
  return `wealthpilot:${filename}`;
}
