const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');
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

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.setAuthor({ name: `Viewing information for ${message.guild.name}`, iconURL: message.guild.iconURL({ dynamic: true }) })
				.setDescription(`**Server Roles [${roles.length}]**\n${!roleArr.length ? roles.join(', ') : `${roleArr.join(', ')}... ${roles.length - roleArr[0].split(', ').length + 1} more!`}`)
				.setFooter({ text: `${this.client.user.username}`, iconURL: this.client.user.displayAvatarURL({ dynamic: true }) });
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

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.setAuthor({ name: `Viewing information for ${message.guild.name}`, iconURL: message.guild.iconURL({ dynamic: true }) })
				.setDescription(`**Server Emojis [${emojiMap.length}]**\n${!emojiArr.length ? emojiMap.join(', ') : `${emojiArr.join(', ')}... ${emojiMap.length - emojiArr[0].split(', ').length + 1} more!`}`)
				.setFooter({ text: `${this.client.user.username}`, iconURL: this.client.user.displayAvatarURL({ dynamic: true }) });
			message.channel.send({ embeds: [embed] });
			return;
		}

		const guildOwner = await message.guild.fetchOwner();
		const members = message.guild.members.cache;
		const channels = message.guild.channels.cache;

		const textChan = channels.filter(channel => channel.type === 'text');
		const voiceChan = channels.filter(channel => channel.type === 'voice');

		const online = members.filter(p => p.presence.status === 'online').size;
		const idle = members.filter(p => p.presence.status === 'idle').size;
		const dnd = members.filter(p => p.presence.status === 'dnd').size;
		const offline = members.filter(p => p.presence.status === 'offline').size;

		const embed = new MessageEmbed()
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.setThumbnail(message.guild.iconURL({ dynamic: true }))
			.setAuthor({ name: `Viewing information for ${message.guild.name}`, iconURL: message.guild.iconURL({ dynamic: true }) })
			.addField(`Guild information`,
				`**◎ 👑 Owner:** ${guildOwner.user}
				**◎ 🆔 ID:** ${message.guild.id}
				**◎ 📅 Created At:** ${moment(message.guild.createdTimestamp).format('ddd, MMM Do YYYY h:mm a')} - ${moment(message.guild.createdTimestamp).fromNow()}
				**◎ 🔐 Verification Level:** ${verificationLevels[message.guild.verificationLevel]}
				**◎ 🔏 MFA Level:** ${mfa[message.guild.mfaLevel]} 
				\u200b`)
			.addFields({ name: `**Guild Members** [${members.size.toLocaleString('en')}]`, value: `<:Online:748655722740580403> | Online: ${online.toLocaleString('en')}\n<:Idle:748655722639917117> | Away: ${idle.toLocaleString('en')}\n<:DND:748655722979393657> | DnD: ${dnd.toLocaleString('en')}\n<:Offline:748655722677403850> | Offline: ${offline.toLocaleString('en')}`, inline: true },
				{ name: `**Guild Channels** [${textChan.size + voiceChan.size}]`, value: `<:TextChannel:855591004236546058> | Text: ${textChan.size}\n<:VoiceChannel:855591004300115998> | Voice: ${voiceChan.size}`, inline: true },
				{ name: `**Guild Perks**`, value: `<a:Booster:855593231294267412> | Boost Tier: ${tiers[message.guild.premiumTier]}\n<a:Booster:855593231294267412> | Boosts: ${message.guild.premiumSubscriptionCount}`, inline: true },
				{ name: `**Server Roles [${roles.length}]**`, value: `To view all server roles, run\n\`${prefix}serverinfo roles\``, inline: true },
				{ name: `**Server Emojis [${emojis.size}]**`, value: `To view all server emojis, run\n\`${prefix}serverinfo emojis\``, inline: true })
			.setFooter({ text: `${this.client.user.username}`, iconURL: this.client.user.displayAvatarURL({ dynamic: true }) });
		message.channel.send({ embeds: [embed] });
	}

};
