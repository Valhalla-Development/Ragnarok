const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');

const filterLevels = {
	DISABLED: 'Off',
	MEMBERS_WITHOUT_ROLES: 'No Role',
	ALL_MEMBERS: 'Everyone'
};
const verificationLevels = {
	NONE: 'None',
	LOW: 'Low',
	MEDIUM: 'Medium',
	HIGH: '(╯°□°）╯︵ ┻━┻',
	VERY_HIGH: '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻'
};
const regions = {
	brazil: 'Brazil',
	europe: 'Europe',
	hongkong: 'Hong Kong',
	india: 'India',
	japan: 'Japan',
	russia: 'Russia',
	singapore: 'Singapore',
	southafrica: 'South Africa',
	sydney: 'Sydney',
	london: 'London',
	frankfurt: 'Frankfurt',
	dubai: 'Dubai',
	amsterdam: 'Amsterdam',
	'south-korea': 'South Korea',
	'eu-west': 'EU West',
	'eu-central': 'EU Central',
	'us-central': 'US Central',
	'us-east': 'US East',
	'us-west': 'US West',
	'us-south': 'US South'
};

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['server', 'guild', 'guildinfo'],
			description: 'Displays stats on the guild.',
			category: 'Informative'
		});
	}

	async run(message) {
		const guildOwner = await message.guild.fetchOwner();
		const roles = message.guild.roles.cache
			.sort((a, b) => b.position - a.position)
			.map(role => role.toString())
			.slice(0, -1);

		const members = message.guild.members.cache;
		const channels = message.guild.channels.cache;
		const emojis = message.guild.emojis.cache;

		const embed = new MessageEmbed()
			.setDescription(`**Guild information for __${message.guild.name}__**`)
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.setThumbnail(message.guild.iconURL({ dynamic: true }))
			.addField('General',
				`**◎ Name:** ${message.guild.name}
				**◎ ID:** ${message.guild.id}
				**◎ Owner:** ${guildOwner.user.tag}
				**◎ Region:** ${regions[message.guild.region]}
				**◎ Boost Tier:** ${message.guild.premiumTier ? `Tier ${message.guild.premiumTier}` : 'None'}
				**◎ Explicit Filter:** ${filterLevels[message.guild.explicitContentFilter]}
				**◎ Verification Level:** ${verificationLevels[message.guild.verificationLevel]}
				**◎ Time Created:** ${moment(message.guild.createdTimestamp).format('LT')} ${moment(message.guild.createdTimestamp).format('LL')} - ${moment(message.guild.createdTimestamp).fromNow()}
				\u200b`)
			.addField('Statistics',
				`**◎ Role Count:** ${roles.length}
				**◎ Emoji Count:** ${emojis.size}
				**◎ Regular Emoji Count:** ${emojis.filter(emoji => !emoji.animated).size}
				**◎ Animated Emoji Count:** ${emojis.filter(emoji => emoji.animated).size}
				**◎ Member Count:** ${message.guild.memberCount}
				**◎ Humans:** ${members.filter(member => !member.user.bot).size}
				**◎ Bots:** ${members.filter(member => member.user.bot).size}
				**◎ Text Channels:** ${channels.filter(channel => channel.type === 'text').size}
				**◎ Voice Channels:** ${channels.filter(channel => channel.type === 'voice').size}
				**◎ Boost Count:** ${message.guild.premiumSubscriptionCount || '0'}
				\u200b
				Roles [${roles.length}] 
				${roles.length < 10 ? roles.join(', ') : roles.length > 10 ? this.client.utils.trimArray(roles) : 'None'}`)
			.setTimestamp();
		message.channel.send({ embed: embed });
	}

};
