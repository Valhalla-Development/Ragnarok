const {
  MessageEmbed
} = require("discord.js");

module.exports = async (bot, guild) => {

  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`${prefixgen}help | ${client.guilds.size} Guilds ${client.users.size} Users`, {
    type: "WATCHING"
  });

  let defaultChannel = "";
  guild.channels.forEach((channel) => {
    if (channel.type == "text" && defaultChannel == "") {
      if (channel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
        defaultChannel = channel;
      }
    }
  });
  let embed = new MessageEmbed()
    .setTitle(`Hello, I'm **Ragnarok**! Thanks for inviting me!`)
    .setDescription(`The prefix for all my commands is \`-\`, e.g: \`-help\`.`);
  defaultChannel.send({
    embed
  });
};