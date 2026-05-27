const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Tampilkan semua commands"),

  async execute(interaction) {
    const embed = {
      title:  "Inventory Bot — Commands",
      color:  3447003,
      fields: [
        { name: "/cekstok",              value: "Lihat semua stok inventory",                 inline: false },
        { name: "/deposit kode jumlah",  value: "Tambah stok barang\nContoh: /deposit W1 5", inline: false },
        { name: "/withdraw kode jumlah", value: "Kurangi stok\nContoh: /withdraw W1 3",      inline: false },
        { name: "/help",                 value: "Tampilkan halaman ini",                     inline: false }
      ],
      footer: { text: "Sunda Pride Roleplay" }
    };

    await interaction.reply({ embeds: [embed] });
  }
};
