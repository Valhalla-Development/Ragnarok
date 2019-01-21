module.exports.run = async (client, message, args, color) => {


    message.delete();

  	const modRole = message.guild.roles.find(r => ["Support Team"].includes(r.name))
  	if (!modRole) return message.channel.send(`This server doesn't have a \`Support Team\` role made, so the ticket won't be opened.\nIf you are an administrator, make one with that name exactly and give it to users that should be able to see tickets.`);

    if (!message.member.roles.has(modRole.id)) return message.reply(`Sorry! You do not have the **${modRole}** role.`);

    if (!message.channel.name.startsWith(`ticket-`)) return message.channel.send(`:x: You can't use the close command outside of a ticket channel.`);

    if (message.channel.name.startsWith("ticket-")) {
        message.channel.delete();
}
};

module.exports.help = {
    name: "forceclose"
  }
