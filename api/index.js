const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Webhook setup for Vercel
export default async (req, res) => {
    if (req.method === 'POST') {
        await bot.handleUpdate(req.body);
        res.status(200).send('OK');
    } else {
        res.status(200).send('Bot is running...');
    }
};

bot.start((ctx) => ctx.reply('Welcome! Send me a Terabox link.'));

bot.on('text', (ctx) => {
    const userLink = ctx.message.text;
    
    // URL validate karne ke liye check (Simple check)
    if (userLink.includes('terabox') || userLink.includes('terashare')) {
        // Hum link ko Base64 ya query param ke zariye pass karenge
        const encodedUrl = encodeURIComponent(userLink);
        const redirectPage = `https://${process.env.VERCEL_URL}/index.html?url=${encodedUrl}`;

        ctx.reply('Aapki file taiyar hai!', 
            Markup.inlineKeyboard([
                [Markup.button.url('▶️ Play & Download', redirectPage)]
            ])
        );
    } else {
        ctx.reply('Please send a valid Terabox link.');
    }
});
