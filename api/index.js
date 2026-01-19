const { Telegraf, Markup } = require("telegraf");
const { MongoClient } = require("mongodb");

const bot = new Telegraf(process.env.BOT_TOKEN);

// ENV
const MONGO_URI = process.env.MONGODB_URI;
const ADMIN_ID = Number(process.env.ADMIN_ID);

// Mongo
let client;
let usersCol;

async function connectDB() {
  if (usersCol) return usersCol;

  client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db("teraplaydown");
  usersCol = db.collection("users");

  await usersCol.createIndex({ userId: 1 }, { unique: true });
  return usersCol;
}

// Save / update user
async function saveUser(ctx) {
  const users = await connectDB();
  const u = ctx.from;

  await users.updateOne(
    { userId: u.id },
    {
      $set: {
        userId: u.id,
        username: u.username || "",
        firstName: u.first_name || "",
        lastSeen: new Date()
      }
    },
    { upsert: true }
  );
}

// START
bot.start(async (ctx) => {
  await saveUser(ctx);
  ctx.reply(
    "💌 Welcome to Desitera Bot!\n\nSend any Terabox link to get Play & Download."
  );
});

// TEXT HANDLER
bot.on("text", async (ctx) => {
  await saveUser(ctx);
  const text = ctx.message.text.trim();

  // ================= ADMIN =================
  if (ctx.from.id === ADMIN_ID) {
    if (text === "/stats") {
      const users = await connectDB();
      const total = await users.countDocuments();
      const active24h = await users.countDocuments({
        lastSeen: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      return ctx.reply(
        `📊 Bot Stats\n\n👥 Total Users: ${total}\n⚡ Active (24h): ${active24h}`
      );
    }

    if (text.startsWith("/broadcast")) {
      const msg = text.replace("/broadcast", "").trim();
      if (!msg) return ctx.reply("❌ Broadcast message missing");

      const users = await connectDB();
      const allUsers = await users.find().toArray();

      let sent = 0;
      for (const u of allUsers) {
        try {
          await bot.telegram.sendMessage(u.userId, msg);
          sent++;
        } catch {}
      }
      return ctx.reply(`📢 Broadcast sent to ${sent} users`);
    }
  }

  // ================= USER FLOW =================
  if (
    text.includes("terabox") ||
    text.includes("terashare") ||
    text.includes("nephobox")
  ) {
    const landingUrl =
      "https://teraplaydown-site.vercel.app/?link=" +
      encodeURIComponent(text);

    // 1️⃣ Main button message
    const playMsg = await ctx.reply(
      "📥 File Ready!",
      Markup.inlineKeyboard([
        Markup.button.url("▶️ Play & Download", landingUrl)
      ])
    );

    // 2️⃣ Note message
    const noteMsg = await ctx.reply(
      "⚠️ *Note:*\nYe link *5 minutes* ke baad automatically delete ho jaayega.\n📌 Please forward save messages ⏱",
      { parse_mode: "Markdown" }
    );

    // 3️⃣ Auto delete after 5 minutes
    setTimeout(async () => {
      try {
        await ctx.deleteMessage(playMsg.message_id);
        await ctx.deleteMessage(noteMsg.message_id);
      } catch (e) {
        // message already deleted / user blocked
      }
    }, 5 * 60 * 1000); // 5 minutes

    return;
  }

  ctx.reply("❌ Please send a valid Terabox link");
});

// VERCEL HANDLER
module.exports = async (req, res) => {
  if (req.method === "POST") {
    await bot.handleUpdate(req.body);
    return res.status(200).json({ ok: true });
  }
  res.status(200).send("Bot running");
};
