const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');

const flags = {
	DISCORD_EMPLOYEE: 'Discord Employee',
	DISCORD_PARTNER: 'Discord Partner',
	BUGHUNTER_LEVEL_1: 'Bug Hunter (Level 1)',
	BUGHUNTER_LEVEL_2: 'Bug Hunter (Level 2)',
	HYPESQUAD_EVENTS: 'HypeSquad Events',
	HOUSE_BRAVERY: 'House of Bravery',
	HOUSE_BRILLIANCE: 'House of Brilliance',
	HOUSE_BALANCE: 'House of Balance',
	EARLY_SUPPORTER: 'Early Supporter',
	TEAM_USER: 'Team User',
	SYSTEM: 'System',
	VERIFIED_BOT: 'Verified Bot',
	VERIFIED_DEVELOPER: 'Verified Bot Developer'
};

const status = {
	online: 'Online.',
	idle: 'Idle.',
	dnd: 'Do not disturb.',
	offline: 'Offline.'
};

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['whois'],
			description: 'Displays information on tagged user.',
			category: 'Informative',
			usage: '<@user>'
		});
	}

	async run(message, args) {
		const member = message.mentions.members.first() || message.guild.members.cache.find((a) => a.id === args[0]) || message.member;
		const roles = member.roles.cache
			.sort((a, b) => b.position - a.position)
			.map(role => role.toString())
			.slice(0, -1);
		const userFlags = member.user.flags.toArray();

		const embed = new MessageEmbed()
			.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
			.setColor(member.displayHexColor || message.guild.me.displayHexColor || 'A10000')
			.addField('User', [
				`**◎ Username:** ${member.user.username}#${member.user.discriminator}`,
				`**◎ ID:** ${member.id}`,
				`**◎ Flags:** ${userFlags.length ? userFlags.map(flag => flags[flag]).join(', ') : 'None'}`,
				`**◎ Avatar:** [Link to avatar](${member.user.displayAvatarURL({ dynamic: true })})`,
				`**◎ Time Created:** ${moment(member.user.createdTimestamp).format('LT')} ${moment(member.user.createdTimestamp).format('LL')} - ${moment(member.user.createdTimestamp).fromNow()}`,
				`**◎ Status:** ${status[member.user.presence.status]}`,
				`**◎ Game:** ${member.user.presence.activities[0] ? member.user.presence.activities[0].name : 'Not playing a game.'}`,
				`\u200b`
			])
			.addField('Member', [
				`**◎ Highest Role:** ${member.roles.highest.id === message.guild.id ? 'None' : member.roles.highest}`,
				`**◎ Server Join Data:** ${moment(member.joinedAt).format('LL LTS')}`,
				`**◎ Roles [${roles.length}]:** ${roles.length < 10 ? roles.join(', ') : roles.length > 10 ? this.client.utils.trimArray(roles) : 'None'}`,
				`\u200b`
			]);
		message.channel.send(embed);
	}

};
