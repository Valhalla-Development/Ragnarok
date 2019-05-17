const { MessageEmbed } = require('discord.js');
const { ownerID } = require('../../storage/config.json');
const moment = require('moment');

module.exports = {
	config: {
		name: 'userinfo',
		usage: '${prefix}userinfo <@user>',
		category: 'informative',
		description: 'Displays informations about the mentioned user',
		accessableby: 'Staff',
	},
	run: async (bot, message, args, color) => {
		const language = require('../../storage/messages.json');

		if (
			!message.member.hasPermission('MANAGE_GUILD') &&
			message.author.id !== ownerID
		) {return message.channel.send(`${language.userinfo.noPermission}`);}

		const user = message.mentions.users.first() || message.author;
		const member = message.mentions.members.first() || message.member;
		const embed = new MessageEmbed()
			.setAuthor(user.tag, user.avatarURL())
			.setDescription('<@' + user.id + '>')
			.addField('Nickname', member.nickname ? member.nickname : 'None', true)
			.addField('Username', user.username, true)
			.addField('Registered', `${moment(user.createdAt).format('LLLL')}`, true)
			.addField('Is a bot account?', user.bot ? 'Yes' : 'No', true)
			.addField('Status', user.presence.status, true)
			.addField(
				'Game',
				user.presence.game ? user.presence.game.name : 'None',
				true
			)
			.addField('Joined', `${moment(member.joinedAt).format('LLLL')}`, true)
			.addField(
				'Roles [' + member.roles.size + ']',
				member.roles.map(r => r.name).join(', '),
				true
			)
			.setThumbnail(user.avatarURL())
			.setTimestamp()
			.setFooter('ID: ' + user.id, user.avatarURL())
			.setColor(color);

		if (!message.channel.permissionsFor(message.guild.me).has('EMBED_LINKS')) {
			message.channel.send(
				':x: **| I need the `EMBED_LINKS` permission to this command to work.**'
			);
			return;
		}

		message.channel.send({
			embed: embed,
		});
	},
};
