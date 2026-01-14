const fetch = require("node-fetch");

const BOT_TOKEN = process.env.BOT_TOKEN;
const BASE_URL = process.env.BASE_URL;

module.exports = async (req, res) => {

  if (req.method !== "POST") {
    return res.status(200).send("TeraPlayDown Bot Active");
  }

  const update = req.body;

  if (!update.message || !update.message.text) {
    return res.status(200).end();
  }

  const chatId = update.message.chat.id;
  const text = update.message.text;

  let payload = {
    chat_id: chatId,
    text: "❌ Send a valid TeraBox link"
  };

  if (text.includes("terabox") || text.includes("1024terabox")) {
    const playerLink =
      BASE_URL + encodeURIComponent(text);

    payload = {
      chat_id: chatId,
      text: "✅ Video Ready 👇",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "▶️ Play & Download",
              url: playerLink
            }
          ]
        ]
      }
    };
  }

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  res.status(200).end();
};
