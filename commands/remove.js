const Discord = require("discord.js");

module.exports.run = async (client, message, args, color) => {
  	const modRole = message.guild.roles.find(r => ["Support Team"].includes(r.name))
  	if (!modRole) return message.channel.send(`This server doesn't have a \`Support Team\` role made, so the ticket won't be opened.\nIf you are an administrator, make one with that name exactly and give it to users that should be able to see tickets.`);

    if (!message.member.roles.has(modRole.id)) return message.reply(`Sorry! You do not have the **${modrole}** role.`);



    let rUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(!rUser) return message.channel.send("Couldn't find user.");
    let rreason = args.join(" ").slice(22);

    if (!message.channel.name.startsWith(`ticket-`)) return message.channel.send(`:x: You can't use the add command outside of a ticket channel.`);
    message.delete().catch(O_o=>{});


    message.channel.overwritePermissions(rUser, {
          READ_MESSAGES: false,
          SEND_MESSAGES: false
    });

    let embed = new Discord.RichEmbed()
    .setColor('36393F')
    .setDescription(`${rUser} has been removed!`)
    message.channel.send(embed);
}

module.exports.help = {
    name: "remove"
  }
