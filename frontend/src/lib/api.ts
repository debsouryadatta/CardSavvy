export type RewardRules = {
  dining: number;
  groceries: number;
  shopping: number;
  travel: number;
  fuel: number;
  utilities: number;
  entertainment: number;
  others: number;
};

export type CardCatalogItem = {
  id: string;
  card_name: string;
  issuer: string;
  network?: string;
  reward_rules: RewardRules;
  source: "manual_verified" | "web_extracted";
  verification_status: "verified" | "pending" | "rejected";
  evidence?: { urls: string[]; notes?: string };
};

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(path, { ...options, headers });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({} as Record<string, unknown>));
    const detail = payload.detail;
    if (typeof payload.error === "string") {
      throw new Error(payload.error);
    }
    if (typeof detail === "string") {
      throw new Error(detail);
    }
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0] as { msg?: string };
      if (first?.msg) {
        throw new Error(first.msg);
      }
    }
    throw new Error("Request failed");
  }
  return (await response.json()) as T;
}
