// /api/debug-env – csak azt mutatja meg, mely környezeti változók vannak
// beállítva (igaz/hamis), az értékeket SOHA nem árulja el.
// Ha már minden működik, nyugodtan törölhető ez a fájl.

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({
    KV_REST_API_URL: Boolean(process.env.KV_REST_API_URL),
    KV_REST_API_TOKEN: Boolean(process.env.KV_REST_API_TOKEN),
    UPSTASH_REDIS_REST_URL: Boolean(process.env.UPSTASH_REDIS_REST_URL),
    UPSTASH_REDIS_REST_TOKEN: Boolean(process.env.UPSTASH_REDIS_REST_TOKEN),
    ADMIN_NAME: Boolean(process.env.ADMIN_NAME),
    ADMIN_PASSWORD: Boolean(process.env.ADMIN_PASSWORD),
  });
};
