// /api/debug-env – megmutatja, mely környezeti változók vannak beállítva
// (igaz/hamis, SOSEM az értéket), és megpróbál ténylegesen kapcsolódni az
// adatbázishoz, hogy lásd, valóban működik-e.
// Ha már minden működik, nyugodtan törölhető ez a fájl.

const { getPrices, whichBackend } = require("./_db");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  const envVars = {
    KV_REST_API_URL: Boolean(process.env.KV_REST_API_URL),
    KV_REST_API_TOKEN: Boolean(process.env.KV_REST_API_TOKEN),
    UPSTASH_REDIS_REST_URL: Boolean(process.env.UPSTASH_REDIS_REST_URL),
    UPSTASH_REDIS_REST_TOKEN: Boolean(process.env.UPSTASH_REDIS_REST_TOKEN),
    REDIS_URL: Boolean(process.env.REDIS_URL),
    ADMIN_NAME: Boolean(process.env.ADMIN_NAME),
    ADMIN_PASSWORD: Boolean(process.env.ADMIN_PASSWORD),
  };

  const backend = whichBackend();
  let connectionTest = "nincs adatbázis beállítva";

  if (backend) {
    try {
      await getPrices();
      connectionTest = "OK – sikeres kapcsolat (" + backend + ")";
    } catch (e) {
      connectionTest = "HIBA: " + (e.message || String(e));
    }
  }

  return res.status(200).json({ envVars, backend, connectionTest });
};
