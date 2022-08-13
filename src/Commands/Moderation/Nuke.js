const Command = require('../../Structures/Command');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Clones the channel and deletes the original.',
			category: 'Moderation',
			userPerms: ['ManageChannels'],
			botPerms: ['ManageChannels']
		});
	}

	async run(message) {
		// Disable for AirReps server
		if (message.guild.id === '657235952116170794') {
			this.client.utils.messageDelete(message, 10000);

			const embed = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addFields({ name: `**${this.client.user.username} - Nuke**`,
					value: `**◎ Error:** This command has been disabled for this server!` });
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const user = message.guild.members.cache.get(message.author.id);

		if (!user.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addFields({ name: `**${this.client.user.username} - Nuke**`,
					value: `**◎ Error:** I need the \`MANAGE_CHANNELS\` permissions to execute this command.` });
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const { channel } = message;

		await channel.clone({ name: `${channel.name}`, reason: 'Nuked!' }).then((chn) => {
			channel.delete();
			chn.setParent(channel.parentId);
			chn.setPosition(channel.rawPosition);
			chn.send({ content: 'Channel has been nuked!\nhttps://tenor.com/view/explosion-mushroom-cloud-atomic-bomb-bomb-boom-gif-4464831' }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		});
	}

};
