const Command = require('../../Structures/Command');
const { EmbedBuilder, ChannelType } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

const verificationLevels = {
	NONE: 'None',
	LOW: 'Low',
	MEDIUM: 'Medium',
	HIGH: 'High',
	VERY_HIGH: 'Very High'
};

const tiers = {
	NONE: '0',
	TIER_1: '1',
	TIER_2: '2',
	TIER_3: '3'
};

const mfa = {
	NONE: 'None',
	ELEVATED: 'Elevated'
};

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['server', 'guild', 'guildinfo'],
			description: 'Displays stats on the guild.',
			category: 'Informative'
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const roles = message.guild.roles.cache
			.sort((a, b) => b.position - a.position)
			.map(role => role.toString())
			.slice(0, -1);

		const emojis = message.guild.emojis.cache;

		const emojiMap = emojis.sort((a, b) => b.position - a.position)
			.map(emoji => emoji.toString());

		if (args[0] === 'roles') {
			const roleArr = [];

			const join = roles.join(', ');
			if (join.length > 4000) {
				const trim = join.substring(0, 4000);
				const lastOf = trim.substring(0, trim.lastIndexOf('<'));
				roleArr.push(lastOf);
			}

			const embed = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.setAuthor({ name: `Viewing information for ${message.guild.name}`, iconURL: message.guild.iconURL({ extension: 'png' }) })
				.setDescription(`**Server Roles [${roles.length}]**\n${!roleArr.length ? roles.join(', ') : `${roleArr.join(', ')}... ${roles.length - roleArr[0].split(', ').length + 1} more!`}`)
				.setFooter({ text: `${this.client.user.username}`, iconURL: this.client.user.displayAvatarURL({ extension: 'png' }) });
			message.channel.send({ embeds: [embed] });
			return;
		}

		if (args[0] === 'emojis') {
			const emojiArr = [];

			const join = emojiMap.join(', ');
			if (join.length > 4000) {
				const trim = join.substring(0, 4000);
				const lastOf = trim.substring(0, trim.lastIndexOf('<'));
				emojiArr.push(lastOf);
			}

			const embed = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.setAuthor({ name: `Viewing information for ${message.guild.name}`, iconURL: message.guild.iconURL({ extension: 'png' }) })
				.setDescription(`**Server Emojis [${emojiMap.length}]**\n${!emojiArr.length ? emojiMap.join(', ') : `${emojiArr.join(', ')}... ${emojiMap.length - emojiArr[0].split(', ').length + 1} more!`}`)
				.setFooter({ text: `${this.client.user.username}`, iconURL: this.client.user.displayAvatarURL({ extension: 'png' }) });
			message.channel.send({ embeds: [embed] });
			return;
		}

		const guildOwner = await message.guild.fetchOwner();
		const channels = message.guild.channels.cache;

		const textChan = channels.filter(channel => channel.type === ChannelType.GuildText);
		const voiceChan = channels.filter(channel => channel.type === ChannelType.GuildVoice);

		const embed = new EmbedBuilder()
			.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
			.setThumbnail(message.guild.iconURL({ extension: 'png' }))
			.setAuthor({ name: `Viewing information for ${message.guild.name}`, iconURL: message.guild.iconURL({ extension: 'png' }) })
			.addFields({ name: `Guild information`,
				value: `**◎ 👑 Owner:** ${guildOwner.user}
				**◎ 🆔 ID:** \`${message.guild.id}\`
				**◎ 📅 Created At:** <t:${Math.round(message.guild.createdTimestamp / 1000)}> - (<t:${Math.round(message.guild.createdTimestamp / 1000)}:R>)
				**◎ 🔐 Verification Level:** \`${verificationLevels[message.guild.verificationLevel]}\`
				**◎ 🔏 MFA Level:** \`${mfa[message.guild.mfaLevel]}\`
				**◎ 🧑‍🤝‍🧑 Guild Members:** \`${message.guild.members.memberCount - message.guild.members.cache.filter((m) => m.user.bot).size.toLocaleString('en')}\`
				**◎ 🤖 Guild Bots:** \`${message.guild.members.cache.filter((m) => m.user.bot).size.toLocaleString('en')}\`
				\u200b` })
			.addFields({ name: `**Guild Channels** [${textChan.size + voiceChan.size}]`,
				value: `<:TextChannel:855591004236546058> | Text: \`${textChan.size}\`\n<:VoiceChannel:855591004300115998> | Voice: \`${voiceChan.size}\``, inline: true },
			{ name: `**Guild Perks**`,
				value: `<a:Booster:855593231294267412> | Boost Tier: \`${tiers[message.guild.premiumTier]}\`\n<a:Booster:855593231294267412> | Boosts: \`${message.guild.premiumSubscriptionCount}\``, inline: true },
			{ name: `**Assets**`,
				value: `**Server Roles [${roles.length}]**: To view all roles, run\n\`${prefix}serverinfo roles\`\n**Server Emojis [${emojis.size}]**: To view all emojis, run\n\`${prefix}serverinfo emojis\``, inline: false })
			.setFooter({ text: `${this.client.user.username}`, iconURL: this.client.user.displayAvatarURL({ extension: 'png' }) });
		message.channel.send({ embeds: [embed] });
	}

};
