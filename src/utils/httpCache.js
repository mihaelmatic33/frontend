const DEFAULT_TTL_MS = 5 * 60 * 1000;
const STORAGE_PREFIX = "http_cache_v1:";

const memoryCache = new Map();
const inflightRequests = new Map();

const now = () => Date.now();

const buildStorageKey = (key) => `${STORAGE_PREFIX}${key}`;

const isFresh = (entry, ttlMs) => {
  if (!entry) return false;
  if (!Number.isFinite(entry.timestamp)) return false;
  return now() - entry.timestamp <= ttlMs;
};

const readSessionCache = (key) => {
  try {
    const raw = sessionStorage.getItem(buildStorageKey(key));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    if (!Object.prototype.hasOwnProperty.call(parsed, "data")) {
      return null;
    }

    return {
      timestamp: Number(parsed.timestamp) || 0,
      data: parsed.data,
    };
  } catch {
    return null;
  }
};

const writeSessionCache = (key, data) => {
  try {
    sessionStorage.setItem(
      buildStorageKey(key),
      JSON.stringify({
        timestamp: now(),
        data,
      }),
    );
  } catch {
    // Ignore storage quota/private mode failures.
  }
};

const getCachedEntry = (key, ttlMs) => {
  const inMemory = memoryCache.get(key);
  if (isFresh(inMemory, ttlMs)) {
    return inMemory;
  }

  const inSession = readSessionCache(key);
  if (isFresh(inSession, ttlMs)) {
    memoryCache.set(key, inSession);
    return inSession;
  }

  return null;
};

export const fetchJsonCached = async (url, options = {}) => {
  const {
    cacheKey = url,
    ttlMs = DEFAULT_TTL_MS,
    force = false,
    init,
  } = options;

  if (!force) {
    const cachedEntry = getCachedEntry(cacheKey, ttlMs);
    if (cachedEntry) {
      return cachedEntry.data;
    }
  }

  if (inflightRequests.has(cacheKey)) {
    return inflightRequests.get(cacheKey);
  }

  const requestPromise = fetch(url, init)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response.json();
    })
    .then((data) => {
      const nextEntry = { timestamp: now(), data };
      memoryCache.set(cacheKey, nextEntry);
      writeSessionCache(cacheKey, data);
      return data;
    })
    .finally(() => {
      inflightRequests.delete(cacheKey);
    });

  inflightRequests.set(cacheKey, requestPromise);
  return requestPromise;
};
