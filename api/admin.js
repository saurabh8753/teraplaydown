const { MongoClient } = require("mongodb");

const MONGO_URI = process.env.MONGODB_URI;
const ADMIN_KEY = process.env.ADMIN_KEY;

module.exports = async (req, res) => {
  if (req.query.key !== ADMIN_KEY) {
    return res.status(401).send("Unauthorized");
  }

  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db("teraplaydown");

  const total = await db.collection("users").countDocuments();
  const active = await db.collection("users").countDocuments({
    lastSeen: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
  });

  res.setHeader("Content-Type", "text/html");
  res.end(`
    <h2>📊 Admin Panel</h2>
    <p><b>Total Users:</b> ${total}</p>
    <p><b>Active (24h):</b> ${active}</p>

    <form method="POST" action="/api/admin?key=${ADMIN_KEY}">
      <textarea name="msg" rows="4" cols="40"
        placeholder="Broadcast message"></textarea><br><br>
      <button type="submit">Send Broadcast</button>
    </form>
  `);
};
