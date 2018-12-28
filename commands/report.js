const Discord = require("discord.js");

module.exports.run = async (client, message, args, color) => {
    let cnt = message.content
    if (cnt !== " ") {
        message.delete(10) // ?
    };

    let language = require(`../messages/messages_en-US.json`);
    let target = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    let reports = message.guild.channels.find(x => x.name === "reports");
    let reason = args.slice(1).join(' ');

    if (!target) return message.channel.send(`${language["report"].notarget}`).then(message => message.delete(5000));
    if (!reason) return message.channel.send(`${language["report"].noreason}`).then(message => message.delete(5000));
    if (!reports) return message.guild.createChannel("reports").then(channel => {
        channel.setTopic(`Reports specific channel`).then(message.channel.send(`${language["report"].channelcreated}`).then(message => message.delete(5000)));
    });

    let reportembed = new Discord.RichEmbed()
        .setThumbnail(target.user.avatarURL)
        .setAuthor('Report', 'https://cdn.discordapp.com/emojis/465245981613621259.png?v=1')
        .setDescription(`New report by ${message.author.username}`)
        .addField('⚠ - Reported Member', `${target.user.tag}\n(${target.user.id})`, true)
        .addField('⚠ - Reported by', `${message.author.tag}\n(${message.author.id})`, true)
        .addField('⚙ - Channel', `${message.channel}`)
        .addField('🔨 - Reason', `${reason}`)
        .setColor('0xfc4f35')
        .setTimestamp();
    reports.send(reportembed);

    message.channel.send(`**${target}** was reported by **${message.author}**`).then(message => message.delete(5000));
};

module.exports.help = {
    name: "report"
};