const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');

const flags = {
	DISCORD_EMPLOYEE: '<:DiscordStaff:748651259849998377>',
	DISCORD_CERTIFIED_MODERATOR: '<:CertifiedModerator:854722328382406676>',
	PARTNERED_SERVER_OWNER: '<:DiscordPartner:748985364022165694>',
	BUGHUNTER_LEVEL_1: '<:DiscordBugHunter1:748651259724300364>',
	BUGHUNTER_LEVEL_2: '<:DiscordBugHunter2:748651259741077574>',
	HYPESQUAD_EVENTS: '<:HypeSquadEvents:748651259761786981>',
	HOUSE_BRAVERY: '<:HypeSquadBravery:748651259845673020>',
	HOUSE_BRILLIANCE: '<:HypeSquadBrilliance:748651259933753464>',
	HOUSE_BALANCE: '<:HypeSquadBalance:748651259631894579>',
	EARLY_SUPPORTER: '<:DiscordNitroEarlySupporter:748651259816312992>',
	TEAM_USER: 'Team User',
	SYSTEM: 'System',
	VERIFIED_BOT: '<:VerifiedBot:854725852101476382>',
	EARLY_VERIFIED_BOT_DEVELOPER: '<:VerifiedBotDeveloper:748651259858255973>',
	BOT_ACCOUNT: '<:Bot:854724408458870814>'
};

const status = {
	online: '<:Online:748655722740580403>',
	idle: '<:Idle:748655722639917117>',
	dnd: '<:DND:748655722979393657>',
	offline: '<:Offline:748655722677403850>'
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
		if (member.user.bot && !userFlags.includes('VERIFIED_BOT')) userFlags.push('BOT_ACCOUNT');

		const embed = new MessageEmbed()
			.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
			.setColor(this.client.utils.color(member.displayHexColor))
			.addField('User',
				`**◎ Username:** ${member.user.username}#${member.user.discriminator}
				**◎ ID:** ${member.id}
				**◎ Flags:** ${userFlags.length ? userFlags.map(flag => flags[flag]).join(', ') : 'None'}
				**◎ Avatar:** [Link to avatar](${member.user.displayAvatarURL({ dynamic: true })})
				**◎ Time Created:** ${moment(member.user.createdTimestamp).format('LT')} ${moment(member.user.createdTimestamp).format('LL')} - ${moment(member.user.createdTimestamp).fromNow()}
				**◎ Status:** ${status[member.user.presence.status]}
				**◎ Game:** ${member.user.presence.activities[0] ? member.user.presence.activities[0].name : 'Not playing a game.'}
				\u200b`)
			.addField('Member',
				`**◎ Highest Role:** ${member.roles.highest.id === message.guild.id ? 'None' : member.roles.highest}
				**◎ Server Join Data:** ${moment(member.joinedAt).format('LL LTS')}
				${roles.length ? `**◎ Roles [${roles.length}]:**` : '**◎ Roles:** None'} ${roles.length < 10 ? roles.join(', ') : roles.length > 9 ? this.client.utils.trimArray(roles) : 'None'}
				\u200b`);
		message.channel.send({ embeds: [embed] });
	}

};
