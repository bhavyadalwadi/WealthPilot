import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const storageDir = path.join(process.cwd(), "db", "storage");

export async function readJsonFile<T>(filename: string, fallback: T): Promise<T> {
  await ensureStorageDir();

  try {
    const raw = await readFile(path.join(storageDir, filename), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonFile<T>(filename: string, data: T) {
  await ensureStorageDir();
  await writeFile(path.join(storageDir, filename), JSON.stringify(data, null, 2), "utf8");
}

async function ensureStorageDir() {
  await mkdir(storageDir, { recursive: true });
}
