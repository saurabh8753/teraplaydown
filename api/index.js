bot.on('text', (ctx) => {
    const userLink = ctx.message.text;
    
    if (userLink.includes('terabox') || userLink.includes('terashare')) {
        // Aapka Vercel domain yahan aayega
        const domain = "apka-bot-naam.vercel.app"; 
        
        // Link ko query parameter mein bhejna
        const landingPageUrl = `https://${domain}/index.html?link=${encodeURIComponent(userLink)}`;

        ctx.reply('📥 Aapki File Ready Hai!', 
            Markup.inlineKeyboard([
                [Markup.button.url('▶️ Play & Download', landingPageUrl)]
            ])
        );
    }
});
