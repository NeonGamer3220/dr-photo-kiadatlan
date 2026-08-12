// /api/prices – csomagárak lekérése (mindenki) és frissítése (csak admin)
// Adatbázis: Vercel KV (Upstash Redis REST API)

const DEFAULTS = {
  jegyes: "65.000 Ft",
  alap: "180.000 Ft",
  alom: "275.000 Ft",
};

const KEY = "dr-photo-prices";

module.exports = async function handler(req, res) {
  const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!KV_URL || !KV_TOKEN) {
    return res.status(500).json({
      error:
        "Az adatbázis nincs csatlakoztatva ehhez a projekthez (hiányzó KV_REST_API_URL/UPSTASH_REDIS_REST_URL vagy a token).",
    });
  }

  if (req.method === "GET") {
    try {
      const r = await fetch(`${KV_URL}/get/${KEY}`, {
        headers: { Authorization: `Bearer ${KV_TOKEN}` },
      });
      const data = await r.json();
      let prices = DEFAULTS;
      if (data && data.result) {
        try {
          prices = { ...DEFAULTS, ...JSON.parse(data.result) };
        } catch (e) {
          prices = DEFAULTS;
        }
      }
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json({ prices });
    } catch (e) {
      return res.status(500).json({ error: "Hiba az árak betöltésekor." });
    }
  }

  if (req.method === "POST") {
    const ADMIN_NAME = process.env.ADMIN_NAME;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    const body = req.body || {};
    const { name, password, prices } = body;

    if (!ADMIN_NAME || !ADMIN_PASSWORD) {
      return res.status(500).json({
        error:
          "A bejelentkezési adatok nincsenek beállítva a szerveren (ADMIN_NAME / ADMIN_PASSWORD).",
      });
    }

    if (name !== ADMIN_NAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Hibás név vagy jelszó." });
    }

    if (!prices || typeof prices !== "object") {
      return res.status(400).json({ error: "Hiányzó vagy hibás adat." });
    }

    const clean = {
      jegyes: String(prices.jegyes || DEFAULTS.jegyes).slice(0, 40),
      alap: String(prices.alap || DEFAULTS.alap).slice(0, 40),
      alom: String(prices.alom || DEFAULTS.alom).slice(0, 40),
    };

    try {
      await fetch(`${KV_URL}/set/${KEY}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${KV_TOKEN}` },
        body: JSON.stringify(clean),
      });
      return res.status(200).json({ ok: true, prices: clean });
    } catch (e) {
      return res.status(500).json({ error: "Hiba a mentés közben." });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Nem támogatott metódus." });
};
