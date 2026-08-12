# Admin panel + adatbázis – beüzemelési útmutató

Ez a weboldal mostantól egy valódi, szerver oldali adatbázist használ a
csomagárak tárolására, így ha az admin panelben módosítasz egy árat, azt
**minden látogató látja**, bárhonnan nyitja meg az oldalt – nem csak a te
böngésződben.

Ehhez 2 dolgot kell beállítanod a Vercel felületén, feltöltés (deploy) után.
Kb. 5 perc az egész.

## 1. lépés – Adatbázis létrehozása (Vercel KV)

1. Nyisd meg a projektedet a [vercel.com](https://vercel.com) irányítópultján.
2. Menj a **Storage** fülre.
3. Kattints a **Create Database** gombra.
4. Válaszd a **KV** (Redis) opciót – ez ingyenes a kis oldalaknak.
5. Nevezd el (pl. `dr-photo-prices`), majd hozd létre.
6. Amikor kész, kattints a **Connect Project** gombra, és válaszd ki a
   dr-photo projektet. Ez automatikusan létrehozza a szükséges
   `KV_REST_API_URL` és `KV_REST_API_TOKEN` környezeti változókat – ezekhez
   nem kell hozzányúlnod, a kód már ezeket keresi.

## 2. lépés – Admin belépési adatok beállítása

A biztonság kedvéért a név és jelszó **nincs benne a kódban** – ezt neked
kell beállítanod környezeti változóként, így senki nem láthatja meg a
forráskódban.

1. A projektedben menj a **Settings → Environment Variables** menüpontba.
2. Adj hozzá két új változót:

   | Name             | Value           |
   |------------------|-----------------|
   | `ADMIN_NAME`     | `Dóczi Róbert`  |
   | `ADMIN_PASSWORD` | `Speedyr80..`   |

3. Mentsd el mindkettőt (Production környezetre is jelöld be).

## 3. lépés – Újratelepítés (Redeploy)

Mivel új környezeti változókat adtál hozzá, a Vercel-nek újra kell építenie
az oldalt, hogy ezeket felismerje:

1. Menj a **Deployments** fülre.
2. A legutolsó deploy-nál kattints a `...` menüre → **Redeploy**.

## Kész! Így teszteld

1. Nyisd meg: `dr-photo.hu/admin`
2. Jelentkezz be: Név: `Dóczi Róbert`, Jelszó: `Speedyr80..`
3. Módosíts egy árat, mentsd el.
4. Nyisd meg egy másik böngészőben (vagy telefonon) az
   `dr-photo.hu/informaciok` oldalt – az új árnak ott is meg kell jelennie.

---

### Ha valamit módosítani szeretnél később

- **Jelszó csere**: csak az `ADMIN_PASSWORD` environment variable-t kell
  átírnod a Vercel-en, majd Redeploy – a kódhoz nem kell nyúlni.
- **Új csomag hozzáadása**: szólj, és bővítem az admin felületet és az API-t
  egy negyedik (vagy tetszőleges számú) csomaggal.
