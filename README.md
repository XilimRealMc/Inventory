# Inventory Bot — Setup Guide

## Struktur File
```
inventory-bot/
├── index.js              ← main bot
├── deploy-commands.js    ← register slash commands (run sekali)
├── sheets.js             ← komunikasi ke GAS
├── embedBuilder.js       ← build embed Discord
├── commands/
│   ├── cekstok.js
│   ├── deposit.js
│   ├── withdraw.js
│   └── help.js
├── Kode.gs               ← paste ke Google Apps Script
├── package.json
└── .env                  ← isi credentials
```

---

## Step 1 — Setup Google Apps Script

1. Buka Apps Script → hapus semua → paste isi `Kode.gs`
2. Buka **Project Settings → Script Properties** → tambah:
   - `GAS_SECRET` → isi bebas, contoh: `rahasia123`
3. Deploy ulang sebagai Web App (Execute as: Me, Access: Anyone)
4. Copy URL deploy

---

## Step 2 — Isi .env

```env
DISCORD_BOT_TOKEN=token_bot_kamu
DISCORD_CLIENT_ID=app_id_kamu
DISCORD_GUILD_ID=id_server_discord_kamu
DISCORD_CHANNEL_ID=id_channel_log_kamu

GAS_URL=url_deploy_gas_kamu
GAS_SECRET=rahasia123
```

Cara dapat GUILD_ID dan CHANNEL_ID:
- Aktifkan Developer Mode di Discord (Settings → Advanced → Developer Mode)
- Klik kanan server → Copy Server ID = GUILD_ID
- Klik kanan channel → Copy Channel ID = CHANNEL_ID

---

## Step 3 — Deploy ke Railway

1. Buat akun di https://railway.app
2. New Project → Deploy from GitHub repo
   - Push semua file ke GitHub repo baru dulu
   - Atau pilih "Deploy from local" 
3. Di Railway → tab **Variables** → isi semua key dari `.env`
4. Railway otomatis detect `npm start` dan jalankan bot

---

## Step 4 — Register Slash Commands

Setelah bot jalan di Railway, jalankan sekali di local:

```bash
npm install
node deploy-commands.js
```

---

## Step 5 — Update Web HTML

Ganti `SCRIPT_URL` di web untuk deposit/withdraw:

```js
// Lama — langsung ke GAS
const SCRIPT_URL = "https://script.google.com/...";

// Baru — ke bot Railway untuk transaksi
const BOT_URL    = "https://nama-project.railway.app/transaksi";
const SCRIPT_URL = "https://script.google.com/..."; // tetap untuk loadData
```

Di fungsi `submitBatch`, ganti endpoint:
```js
await fetch(BOT_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(items)
});
```

---

## Cara Kerja

```
Discord /deposit W1 5
  → Bot Railway update GAS
  → GAS update Sheets
  → Bot kirim embed log ke channel Discord

Web klik DEPOSIT SEMUA
  → Web POST ke Bot Railway /transaksi
  → Bot Railway update GAS
  → GAS update Sheets
  → Bot kirim embed log ke channel Discord

Web load data
  → Web GET langsung ke GAS (tetap sama)
```
