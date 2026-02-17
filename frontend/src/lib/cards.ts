import type { CardCatalogItem } from "@/lib/api";

export async function fetchPublicCards(): Promise<CardCatalogItem[]> {
  const response = await fetch("/api/cards/public");
  if (!response.ok) {
    throw new Error("Failed to load cards");
  }
  const payload = (await response.json()) as { cards: CardCatalogItem[] };
  return payload.cards;
}
