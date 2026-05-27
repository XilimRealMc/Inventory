const axios = require("axios");

const GAS_URL    = process.env.GAS_URL;
const GAS_SECRET = process.env.GAS_SECRET;

// ======================================
// GET — Ambil semua data dari Sheets
// ======================================

async function getData() {
  const res  = await axios.get(GAS_URL);
  const rows = res.data;

  const items = [];

  // Skip header (row 0)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[1] || row[3] === "") continue;
    items.push({
      no:       row[0],
      kode:     row[1],
      kategori: row[2],
      nama:     row[3],
      stok:     row[4]
    });
  }

  return items;
}

// ======================================
// POST — Deposit / Withdraw ke Sheets
// ======================================

async function transaksi(aksi, kode, jumlah) {
  const payload = [{
    secret: GAS_SECRET,
    aksi:   aksi,
    kode:   kode,
    jumlah: jumlah
  }];

  const res = await axios.post(GAS_URL, JSON.stringify(payload), {
    headers: { "Content-Type": "text/plain;charset=utf-8" }
  });

  return res.data;
}

module.exports = { getData, transaksi };
