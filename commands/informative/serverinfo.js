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
		const online = message.guild.members.cache.filter(
			member => member.user.presence.status !== 'offline'
		);
		const day = message.guild.createdAt.getDate();
		const month = 1 + message.guild.createdAt.getMonth();
		const year = message.guild.createdAt.getFullYear();
		const sicon = message.guild.iconURL();
		const serverembed = new MessageEmbed()
			.setAuthor(message.guild.name, sicon)
			.setFooter(`Server Created • ${day}.${month}.${year}`)
			.setColor('#7289DA')
			.setThumbnail(sicon)
			.addFields(
				{ name: 'Name', value: message.guild.name, inline: true },
				{ name: 'Owner', value: message.guild.owner.user.tag, inline: true },
				{ name: 'Region', value: message.guild.region, inline: true },
				{ name: 'Channels', value: message.guild.channels.cache.size, inline: true },
				{ name: 'Members', value: `${(message.guild.memberCount).toLocaleString('en')}`, inline: true},
				{ name: 'Humans', value: `${(message.guild.memberCount - message.guild.members.cache.filter(m => m.user.bot).size).toLocaleString('en')}`, inline: true },
				{ name: 'Bots', value: message.guild.members.cache.filter(m => m.user.bot).size, inline: true },
				{ name: 'Online', value: `${(online.size).toLocaleString('en')}`, inline: true },
				{ name: 'Roles', value: message.guild.roles.cache.size, inline: true });
		message.channel.send(serverembed);
	},
};
