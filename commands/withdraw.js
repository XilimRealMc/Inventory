const { SlashCommandBuilder } = require("discord.js");
const { transaksi, getData }  = require("../sheets");
const { buildEmbedStok }      = require("../embedBuilder");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("withdraw")
    .setDescription("Withdraw barang dari inventory")
    .addStringOption(opt =>
      opt.setName("kode")
        .setDescription("Kode barang (contoh: W1)")
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName("jumlah")
        .setDescription("Jumlah withdraw")
        .setMinValue(1)
        .setRequired(true)
    ),

  async execute(interaction, client) {
    await interaction.deferReply();

    const kode   = interaction.options.getString("kode").trim().toUpperCase();
    const jumlah = interaction.options.getInteger("jumlah");
    const user   = interaction.user.username;

    try {
      const result = await transaksi("withdraw", kode, jumlah);

      if (result.errors && result.errors.length > 0) {
        await interaction.editReply("❌ " + result.errors[0]);
        return;
      }

      // Ambil data terbaru lalu kirim embed ke channel log
      const items     = await getData();
      const processed = ["- " + kode + ": -" + jumlah];
      const embed     = buildEmbedStok(items, "📦 LOG INVENTARIS - WITHDRAW", 15548997, user, processed);

      const channel = client.channels.cache.get(process.env.DISCORD_CHANNEL_ID);
      if (channel) await channel.send({ embeds: [embed] });

      await interaction.editReply("✅ Withdraw **" + kode + "** x" + jumlah + " berhasil!");

    } catch (err) {
      console.error("withdraw error:", err);
      await interaction.editReply("❌ Gagal withdraw. Coba lagi.");
    }
  }
};
