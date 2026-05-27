// ==========================================
// INVENTORY SYSTEM - GOOGLE APPS SCRIPT
// ==========================================
// Versi simpel — hanya handle baca & tulis Sheets
// Semua logika Discord ada di bot Node.js (Railway)
// ==========================================

var GAS_SECRET = PropertiesService.getScriptProperties().getProperty("GAS_SECRET");

// ======================================
// doGet — Kirim semua data ke web / bot
// ======================================

function doGet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data  = sheet.getDataRange().getValues();
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ======================================
// doPost — Update stok dari bot Node.js
// Body: JSON array [{secret, aksi, kode, jumlah}]
// ======================================

function doPost(e) {
  try {
    var items  = JSON.parse(e.postData.contents);
    var sheet  = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data   = sheet.getDataRange().getValues();
    var sukses = [];
    var errors = [];

    for (var x = 0; x < items.length; x++) {
      var item = items[x];

      // Validasi secret
      if (item.secret !== GAS_SECRET) {
        errors.push("Unauthorized");
        continue;
      }

      var kode   = String(item.kode).trim().toUpperCase();
      var jumlah = parseInt(item.jumlah);
      var aksi   = String(item.aksi).toLowerCase();
      var found  = false;

      for (var i = 1; i < data.length; i++) {
        if (String(data[i][1]).trim().toUpperCase() === kode) {
          var stokLama = parseInt(data[i][4]) || 0;
          var nama     = data[i][3];

          if (aksi === "withdraw" && stokLama < jumlah) {
            errors.push("Stok tidak cukup: " + nama + " (tersedia: " + stokLama + ")");
            found = true;
            break;
          }

          data[i][4] = aksi === "deposit" ? stokLama + jumlah : stokLama - jumlah;
          sukses.push({ nama: nama, kode: kode, jumlah: jumlah, aksi: aksi });
          found = true;
          break;
        }
      }

      if (!found) {
        errors.push("Kode tidak ditemukan: " + kode);
      }
    }

    if (sukses.length > 0) {
      sheet.getDataRange().setValues(data);
      SpreadsheetApp.flush();
    }

    return ContentService
      .createTextOutput(JSON.stringify({ sukses: sukses.length, errors: errors }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log("doPost error: " + err);
    return ContentService
      .createTextOutput(JSON.stringify({ error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
