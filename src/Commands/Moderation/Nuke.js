const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'E',
			aliases: ['E'],
			description: 'E',
			category: 'E',
			usage: 'E'
		});
	}

	async run(message) {
		// Disable for AirReps server
		if (message.guild.id === '657235952116170794') {
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**Command Disabled**',
					`**◎ Error:** This command has been disabled for this server!`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}
		if (!message.member.hasPermission('ADMINISTRATOR') && !this.client.owners.includes(message.author.id)) {
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**Invalid Perms**',
					`**◎ Error:** You need to have the \`ADMINISTRATOR\` permission to use this command.`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}
		if (!message.guild.member(this.client.user).hasPermission('MANAGE_CHANNELS')) {
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**Invalid Perms**',
					`**◎ Error:** I need the \`MANAGE_CHANNELS\` permissions to execute this command.`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
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
