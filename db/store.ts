const isVercelRuntime = process.env.VERCEL === "1" || Boolean(process.env.VERCEL_ENV);

export type StorageBackend = "sqlite" | "postgres";

export function getStorageBackend(): StorageBackend {
  const strategy = process.env.STORAGE_DRIVER?.trim().toLowerCase();

  if (strategy === "sqlite" || strategy === "postgres") {
    return strategy;
  }

  return isVercelRuntime ? "postgres" : "sqlite";
}
