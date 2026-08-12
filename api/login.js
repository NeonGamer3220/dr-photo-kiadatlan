// /api/login – admin belépés ellenőrzése a szerveren (a jelszó soha nem kerül a böngészőbe/kódba)

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Nem támogatott metódus." });
  }

  const ADMIN_NAME = process.env.ADMIN_NAME;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_NAME || !ADMIN_PASSWORD) {
    return res.status(500).json({
      error:
        "A bejelentkezési adatok nincsenek beállítva a szerveren (ADMIN_NAME / ADMIN_PASSWORD).",
    });
  }

  const { name, password } = req.body || {};

  if (name === ADMIN_NAME && password === ADMIN_PASSWORD) {
    return res.status(200).json({ ok: true });
  }

  return res.status(401).json({ ok: false, error: "Hibás név vagy jelszó." });
};
