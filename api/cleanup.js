const { Telegraf } = require("telegraf");
const { MongoClient } = require("mongodb");

const bot = new Telegraf(process.env.BOT_TOKEN);
const client = new MongoClient(process.env.MONGODB_URI);

module.exports = async (req, res) => {
  await client.connect();
  const db = client.db("teraplaydown");
  const col = db.collection("auto_delete");

  const now = new Date();
  const expired = await col.find({ deleteAt: { $lte: now } }).toArray();

  for (const m of expired) {
    try {
      await bot.telegram.deleteMessage(m.chatId, m.messageId);
    } catch {}
    await col.deleteOne({ _id: m._id });
  }

  res.status(200).send("Cleanup done");
};
