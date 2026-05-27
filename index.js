require("dotenv").config();

const { Client, GatewayIntentBits, Collection } = require("discord.js");
const http = require("http");
const fs   = require("fs");

// ======================================
// SETUP CLIENT
// ======================================

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

// ======================================
// LOAD COMMANDS
// ======================================

const files = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));

for (const file of files) {
  const cmd = require("./commands/" + file);
  client.commands.set(cmd.data.name, cmd);
  console.log("Loaded: " + cmd.data.name);
}

// ======================================
// HANDLE SLASH COMMANDS
// ======================================

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;

  try {
    await cmd.execute(interaction, client);
  } catch (err) {
    console.error("Command error:", err);
    const msg = "❌ Terjadi error, coba lagi.";
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply(msg);
    } else {
      await interaction.reply({ content: msg, ephemeral: true });
    }
  }
});

// ======================================
// HTTP SERVER — Terima request dari Web
// Format: POST /transaksi
// Body: JSON array [{aksi, kode, jumlah}]
// ======================================

const { transaksi, getData } = require("./sheets");
const { buildEmbedStok }     = require("./embedBuilder");

const server = http.createServer(async (req, res) => {

  // CORS headers biar web bisa akses
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/transaksi") {
    let body = "";

    req.on("data", chunk => { body += chunk; });

    req.on("end", async () => {
      try {
        const items  = JSON.parse(body);
        const sukses = [];
        const errors = [];

        for (const item of items) {
          const result = await transaksi(item.aksi, item.kode, item.jumlah);
          if (result.errors && result.errors.length > 0) {
            errors.push(...result.errors);
          } else {
            sukses.push(item);
          }
        }

        if (sukses.length > 0) {
          const data      = await getData();
          const aksiLabel = sukses[0].aksi.toUpperCase();
          const warna     = sukses[0].aksi === "deposit" ? 5763719 : 15548997;
          const processed = sukses.map(t => {
            const s = t.aksi === "deposit" ? "+" : "-";
            return s + " " + t.kode + ": " + s + t.jumlah;
          });

          const embed   = buildEmbedStok(data, "📦 LOG INVENTARIS - " + aksiLabel, warna, "WEB", processed);
          const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);
          if (channel) await channel.send({ embeds: [embed] });
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ sukses: sukses.length, errors }));

      } catch (err) {
        console.error("HTTP error:", err);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: String(err) }));
      }
    });

    return;
  }

  // Health check
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200);
    res.end("Bot is running!");
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(process.env.PORT || 3000, () => {
  console.log("HTTP server running on port " + (process.env.PORT || 3000));
});

// ======================================
// BOT READY
// ======================================

client.once("ready", () => {
  console.log("✅ Bot online: " + client.user.tag);
});

client.login(process.env.DISCORD_BOT_TOKEN);
