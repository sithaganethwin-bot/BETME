// In-memory lot cache for ultra-low latency reads
export const lotCache = new Map<string, { data: any; expiry: number }>();
export const CACHE_TTL_MS = 10000; // 10 seconds TTL with fast SWR

export function invalidateAuctionCache(id?: string) {
  if (id) {
    lotCache.delete(id);
  } else {
    lotCache.clear();
  }
}
