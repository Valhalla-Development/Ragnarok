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
	online: '<:Online:748655722740580403> Online',
	idle: '<:Idle:748655722639917117> Idle',
	dnd: '<:DND:748655722979393657> DnD',
	offline: '<:Offline:748655722677403850> Offline'
};

const types = {
	PLAYING: 'Playing',
	STREAMING: 'Streaming',
	LISTENING: 'Listening',
	WATCHING: 'Watching',
	CUSTOM: 'Custom',
	COMPETING: 'Competing'
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

		const presence = [];

		if (member.user.presence.activities[0]) {
			presence.push(`**${types[member.user.presence.activities[0].type]}:** ${member.user.presence.activities[0].name}`);

			if (member.user.presence.activities[0].details) {
				presence.push(`**Details:** ${member.user.presence.activities[0].details}`);
			}
			if (member.user.presence.activities[0].state) {
				presence.push(`**State:** ${member.user.presence.activities[0].state}`);
			}
		}

		const embed = new MessageEmbed()
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
			.setAuthor(`Viewing information for ${member.user.username}`, member.user.displayAvatarURL({ dynamic: true }))
			.addField(`Member information`,
				`**◎ 👑 User:** ${member.user}
				**◎ 🆔 ID:** ${member.user.id}
				**◎ 📆 Created At** ${moment(member.user.createdTimestamp).format('ddd, MMM Do YYYY h:mm a')} - ${moment(member.user.createdTimestamp).fromNow()}
				**◎ 📆 Joined At** ${moment(member.joinedAt).format('ddd, MMM Do YYYY h:mm a')} - ${moment(member.joinedAt).fromNow()}
				**◎ 🗺️ Flags:** ${userFlags.length ? userFlags.map(flag => flags[flag]).join(', ') : 'None'}
				**◎ <a:Booster:855593231294267412> Server Booster:** ${member.premiumSinceTimestamp ? `${moment(member.premiumSinceTimestamp).format('ddd, MMM Do YYYY h:mm a')} - ${moment(member.premiumSinceTimestamp).fromNow()}` : 'No'}`)

			.addFields({ name: `**Roles: [${roles.length}]**`, value: `${roles.length < 10 ? roles.join('\n') : roles.length >= 10 ? this.client.utils.trimArray(roles, 10).join('\n') : 'None'}`, inline: true },
				{ name: `**Status:**`, value: `${status[member.user.presence.status]}`, inline: true },
				{ name: `**Activity:**`, value: `${presence.length ? presence.join('\n') : 'None'}`, inline: true })
			.setFooter(`${this.client.user.username}`, this.client.user.displayAvatarURL({ dynamic: true }));
		message.channel.send({ embeds: [embed] });
	}

};
