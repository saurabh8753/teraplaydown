const { Telegraf, Markup } = require('telegraf');

// 1. Bot initialization (Ensure BOT_TOKEN is in Vercel Env Variables)
const bot = new Telegraf(process.env.BOT_TOKEN);

// 2. Bot Logic
bot.start((ctx) => ctx.reply('Welcome to TeraPlayDown! Send me a Terabox link to get started.'));

bot.on('text', async (ctx) => {
    const userLink = ctx.message.text;
    
    if (userLink.includes('terabox') || userLink.includes('terashare') || userLink.includes('nephobox')) {
        // Aapka Vercel Domain (Bina https:// ke)
        const domain = "teraplaydown.vercel.app"; 
        
        // Landing page URL with query parameter
        const landingPageUrl = `https://${domain}/index.html?link=${encodeURIComponent(userLink)}`;

        await ctx.reply('📥 Aapki File Ready Hai!', 
            Markup.inlineKeyboard([
                [Markup.button.url('▶️ Play & Download', landingPageUrl)]
            ])
        );
    } else {
        await ctx.reply('Please send a valid Terabox link.');
    }
});

// 3. Vercel Handler (Ye sabse niche hona chahiye)
module.exports = async (req, res) => {
    try {
        if (req.method === 'POST') {
            await bot.handleUpdate(req.body);
            res.status(200).json({ ok: true });
        } else {
            res.status(200).send('Bot is active and running!');
        }
    } catch (error) {
        console.error('Error handling update:', error);
        res.status(500).send('Error');
    }
};
        
