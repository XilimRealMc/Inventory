require("dotenv").config();

const { REST, Routes } = require("discord.js");
const fs               = require("fs");

const commands = [];
const files    = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));

for (const file of files) {
  const cmd = require("./commands/" + file);
  commands.push(cmd.data.toJSON());
  console.log("Loaded command: " + cmd.data.name);
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
  try {
    console.log("Registering slash commands...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID,
        process.env.DISCORD_GUILD_ID
      ),
      { body: commands }
    );

    console.log("✅ Slash commands berhasil didaftarkan!");
  } catch (err) {
    console.error("❌ Error:", err);
  }
})();
