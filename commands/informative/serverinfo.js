const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'serverinfo',
		usage: '${prefix}serverinfo',
		category: 'informative',
		description: 'Displays informations about the server',
		accessableby: 'Everyone',
	},
	run: async (bot, message) => {
		message.delete();
		const online = message.guild.members.filter(
			member => member.user.presence.status !== 'offline'
		);
		const day = message.guild.createdAt.getDate();
		const month = 1 + message.guild.createdAt.getMonth();
		const year = message.guild.createdAt.getFullYear();
		const sicon = message.guild.iconURL;
		const serverembed = new MessageEmbed()
			.setAuthor(message.guild.name, sicon)
			.setFooter(`Server Created • ${day}.${month}.${year}`)
			.setColor('#7289DA')
			.setThumbnail(sicon)
			.addField('ID', message.guild.id, true)
			.addField('Name', message.guild.name, true)
			.addField('Owner', message.guild.owner.user.tag, true)
			.addField('Region', message.guild.region, true)
			.addField('Channels', message.guild.channels.size, true)
			.addField('Members', message.guild.memberCount, true)
			.addField(
				'Humans',
				message.guild.memberCount -
					message.guild.members.filter(m => m.user.bot).size,
				true
			)
			.addField(
				'Bots',
				message.guild.members.filter(m => m.user.bot).size,
				true
			)
			.addField('Online', online.size, true)
			.addField('Roles', message.guild.roles.size, true);
		message.channel.send(serverembed);
	},
};
