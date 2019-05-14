const {
    MessageEmbed
} = require("discord.js");
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = {
    config: {
        name: "flip",
        usage: "${prefix}flip <args>",
        category: "fun",
        description: "Flips your text",
        accessableby: "Everyone"
    },
    run: async (bot, message, args, color) => {
        message.delete();
        const mapping = '¡"#$%⅋,)(*+\'-˙/0ƖᄅƐㄣϛ9ㄥ86:;<=>¿@∀qƆpƎℲפHIſʞ˥WNOԀQɹS┴∩ΛMX⅄Z[/]^_`ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz{|}~';
        const OFFSET = '!'.charCodeAt(0);

        if (args.length < 1) {
            message.channel.send('You must provide text to flip.');
        }

        message.channel.send(
            args.join(' ').split('')
            .map(c => c.charCodeAt(0) - OFFSET)
            .map(c => mapping[c] || ' ')
            .reverse().join('')
        );
    }
};