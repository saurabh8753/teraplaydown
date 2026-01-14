import fetch from "node-fetch";

const BOT_TOKEN = process.env.BOT_TOKEN;
const BASE_URL = process.env.BASE_URL; 
// example: https://teraplaydown.vercel.app/player.html

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("TeraPlayDown Bot Running");
  }

  const update = req.body;

  if (!update.message || !update.message.text) {
    return res.status(200).end();
  }

  const chatId = update.message.chat.id;
  const text = update.message.text;

  let reply = {
    chat_id: chatId,
    text: "Send a valid TeraBox link"
  };

  if (text.includes("terabox") || text.includes("1024terabox")) {
    const playerLink =
      `${BASE_URL}?url=${encodeURIComponent(text)}`;

    reply = {
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
    body: JSON.stringify(reply)
  });

  res.status(200).end();
}
