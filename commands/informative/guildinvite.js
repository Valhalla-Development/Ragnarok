const {
  MessageEmbed
} = require("discord.js");

module.exports = {
  config: {
    name: "guildinvite",
    aliases: ["ginvite"],
    usage: "${prefix}guildinvite",
    category: "informative",
    description: "Posts an invite link to current Discord",
    accessableby: "Everyone"
  },
  run: async (bot, message, args, color) => {

    message.delete();

    if ((!message.member.hasPermission("CREATE_INSTANT_INVITE") && (message.author.id !== config.ownerID))) {
      message.channel.send(`${language.invite.noPermission}`);
      return;
    }

    message.channel.createInvite({
      maxAge: 0
    }).then(invite => {
      let embed = new MessageEmbed()
        .setColor('36393F')
        .setDescription(`:white_check_mark: **Permanent Invite Link**: ${invite}`);
      message.channel.send(embed);
    });
  }
};