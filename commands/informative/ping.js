module.exports = {
    config: {
        name: "ping",
        usage: "${prefix}ping",
        category: "informative",
        description: "Displays bot latency",
        accessableby: "Everyone"
    },
    run: async (bot, message, args, color) => {

        message.delete();

        let language = require('../../storage/messages.json');

        let pingMessage = language.ping.ping;
        const ping = pingMessage.replace("${ping}", Math.round(bot.ws.ping));

        message.channel.send(`${ping}`);
    }
};