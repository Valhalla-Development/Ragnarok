const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Posts server rules',
			category: 'Hidden',
			ownerOnly: true
		});
	}

	async run(message) {
		const channel = message.guild.channels.cache.find((chan) => chan.name === 'testing');

		const embed = new MessageEmbed()
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.setAuthor(`${message.guild.name} - Rules`, message.guild.iconURL({ dynamic: true }))
			.setDescription([
				`**◎ 1:** Any and all forms of racism will **NOT** be tolerated.`,
				`\u3000`,
				`**◎ 2:** Do **NOT** mass tag users/roles.`,
				`\u3000`,
				`**◎ 3:** Do **NOT** spam any channel.`,
				`\u3000`,
				`**◎ 4:** If using any bot in this guild, please keep testing to ${channel}.`,
				`\u3000`
			]);
		message.channel.send(embed);
	}

};
