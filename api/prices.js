// /api/prices – csomagárak lekérése (mindenki) és frissítése (csak admin)
// Az adatbázis-kapcsolatot az api/_db.js intézi (REST API vagy REDIS_URL).

const { getPrices, setPrices, DEFAULTS } = require("./_db");

module.exports = async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const prices = await getPrices();
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json({ prices });
    } catch (e) {
      return res.status(500).json({ error: e.message || "Hiba az árak betöltésekor." });
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
      await setPrices(clean);
      return res.status(200).json({ ok: true, prices: clean });
    } catch (e) {
      return res.status(500).json({ error: e.message || "Hiba a mentés közben." });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Nem támogatott metódus." });
};
