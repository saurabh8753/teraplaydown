const { Telegraf, Markup } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply(
    "💌 Welcome to Desitera Bot!\n\nSend any Terabox link."
  );
});

bot.on("text", async (ctx) => {
  const link = (ctx.message.text || "").trim();

  if (
    link.includes("terabox") ||
    link.includes("terashare") ||
    link.includes("nephobox")
  ) {
    // ✅ ONLY THIS DOMAIN (STATIC SITE)
    const landingUrl =
      "https://teraplaydown-site.vercel.app/?link=" +
      encodeURIComponent(link);

    await ctx.reply(
      "📥 File Ready!",
      Markup.inlineKeyboard([
        Markup.button.url("▶️ Play & Download", landingUrl)
      ])
    );
  } else {
    ctx.reply("❌ Please send a valid Terabox link");
  }
});

// Vercel handler
module.exports = async (req, res) => {
  if (req.method === "POST") {
    await bot.handleUpdate(req.body);
    return res.status(200).json({ ok: true });
  }
  res.status(200).send("Bot running");
};
