// api/_db.js – közös adatbázis-kapcsolat.
// Automatikusan felismeri, melyik típusú Redis-kapcsolatod van beállítva:
//   A) REST API pár: KV_REST_API_URL + KV_REST_API_TOKEN
//      (vagy UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN)
//   B) Sima kapcsolati string: REDIS_URL (pl. redis://... vagy rediss://...)
// Nem kell eldöntened, melyiket használod – amelyik be van állítva, azt
// használja a kód.

const KEY = "dr-photo-prices";

const DEFAULTS = {
  jegyes: "65.000 Ft",
  alap: "180.000 Ft",
  alom: "275.000 Ft",
};

function getRestCreds() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return { url, token };
  return null;
}

let redisClientPromise = null;
function getRedisClient() {
  const REDIS_URL = process.env.REDIS_URL;
  if (!REDIS_URL) return null;
  if (!redisClientPromise) {
    // eslint-disable-next-line global-require
    const { createClient } = require("redis");
    const client = createClient({ url: REDIS_URL });
    client.on("error", function () {
      /* megelőzi, hogy a kapcsolat hibája leállítsa a folyamatot */
    });
    redisClientPromise = client.connect().then(function () {
      return client;
    });
  }
  return redisClientPromise;
}

function whichBackend() {
  if (getRestCreds()) return "rest";
  if (process.env.REDIS_URL) return "redis-url";
  return null;
}

async function getPrices() {
  const backend = whichBackend();

  if (backend === "rest") {
    const { url, token } = getRestCreds();
    const r = await fetch(`${url}/get/${KEY}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await r.json();
    if (data && data.result) {
      try {
        return { ...DEFAULTS, ...JSON.parse(data.result) };
      } catch (e) {
        return DEFAULTS;
      }
    }
    return DEFAULTS;
  }

  if (backend === "redis-url") {
    const client = await getRedisClient();
    const raw = await client.get(KEY);
    if (raw) {
      try {
        return { ...DEFAULTS, ...JSON.parse(raw) };
      } catch (e) {
        return DEFAULTS;
      }
    }
    return DEFAULTS;
  }

  throw new Error(
    "Az adatbázis nincs csatlakoztatva ehhez a projekthez (hiányzik KV_REST_API_URL/UPSTASH_REDIS_REST_URL vagy REDIS_URL)."
  );
}

async function setPrices(prices) {
  const backend = whichBackend();
  const value = JSON.stringify(prices);

  if (backend === "rest") {
    const { url, token } = getRestCreds();
    await fetch(`${url}/set/${KEY}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: value,
    });
    return;
  }

  if (backend === "redis-url") {
    const client = await getRedisClient();
    await client.set(KEY, value);
    return;
  }

  throw new Error(
    "Az adatbázis nincs csatlakoztatva ehhez a projekthez (hiányzik KV_REST_API_URL/UPSTASH_REDIS_REST_URL vagy REDIS_URL)."
  );
}

module.exports = { getPrices, setPrices, DEFAULTS, whichBackend };
