const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['st'],
			description: 'If I failed to input a catch, and the bot won\'t stop typing, run this command.',
			category: 'Moderation',
			userPerms: ['MANAGE_GUILD']
		});
	}

	async run(message) {
		this.client.utils.messageDelete(message, 0);

		if (message.channel.typing) {
			message.channel.stopTyping();

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Stop Typing**`,
					`**◎ Success:** I have stopped typing!`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		} else {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.setImage('https://i.imgflip.com/2dsu9p.jpg')
				.addField(`**${this.client.user.username} - Stop Typing**`,
					`**◎ Error:** Fam, I am not typing?`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}
	}

};
