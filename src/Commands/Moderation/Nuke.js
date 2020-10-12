const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Clones the channel and deletes the original.',
			category: 'Moderation',
			userPerms: ['MANAGE_CHANNELS'],
			botPerms: ['MANAGE_CHANNELS']
		});
	}

	async run(message) {
		// Disable for AirReps server
		if (message.guild.id === '657235952116170794') {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Nuke**`,
					`**◎ Error:** This command has been disabled for this server!`);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}
		if (!message.guild.member(this.client.user).hasPermission('MANAGE_CHANNELS')) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Nuke**`,
					`**◎ Error:** I need the \`MANAGE_CHANNELS\` permissions to execute this command.`);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const { channel } = message;

		await channel.clone({ name: channel.name, reason: 'Nuked!' }).then((chn) => {
			chn.setParent(channel.parentID);
			chn.setPosition(channel.rawPosition);
			channel.delete();
			chn.send('Channel has been nuked!\nhttps://tenor.com/view/explosion-mushroom-cloud-atomic-bomb-bomb-boom-gif-4464831');
			return;
		});
	}

};
