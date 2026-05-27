// ======================================
// Build embed stok dikelompokkan per kategori
// ======================================

function buildEmbedStok(items, title, color, userName, listBarang) {
  const kategoriMap = {};

  for (const item of items) {
    if (!kategoriMap[item.kategori]) kategoriMap[item.kategori] = [];
    kategoriMap[item.kategori].push("- " + item.nama + " (" + item.kode + "): " + item.stok);
  }

  const fields = [];

  if (listBarang && listBarang.length > 0) {
    fields.push({
      name:   "Barang Diproses",
      value:  listBarang.join("\n"),
      inline: false
    });
  }

  for (const kat in kategoriMap) {
    fields.push({
      name:   kat,
      value:  kategoriMap[kat].join("\n") || "-",
      inline: true
    });
  }

  return {
    title:     title,
    color:     color,
    fields:    fields,
    footer:    { text: "Dipicu oleh: " + (userName || "System") + " - Sunda Pride Roleplay" },
    timestamp: new Date().toISOString()
  };
}

module.exports = { buildEmbedStok };
