const { SlashCommandBuilder } = require("discord.js");
const { getData }             = require("../sheets");
const { buildEmbedStok }      = require("../embedBuilder");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("cekstok")
    .setDescription("Cek stok inventory saat ini"),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const items = await getData();
      const embed = buildEmbedStok(
        items,
        "📋 CEK STOK INVENTORY",
        3447003,
        interaction.user.username,
        null
      );

      await interaction.editReply({ embeds: [embed] });

    } catch (err) {
      console.error("cekstok error:", err);
      await interaction.editReply("❌ Gagal mengambil data stok.");
    }
  }
};
