const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const { readdirSync } = require('fs');
const { join } = require('path');

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

	async run(message, args) {
		if (!this.client.owners.includes(message.author.id)) return;

		if (!args[0]) {
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField(`**${this.client.user.username} - Reload**`,
					`**◎ Error:** Please provide a command to reload!`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}
		const commandName = args[0].toLowerCase();
		if (!this.client.commands.get(commandName)) {
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField(`**${this.client.user.username} - Reload**`,
					`**◎ Error:** That command does not exist! Try again.`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}
		readdirSync(join(__dirname, '..')).forEach((f) => {
			const files = readdirSync(join(__dirname, '..', f));
			if (files.includes(`${commandName}.js`)) {
				try {
					delete require.cache[
						require.resolve(join(__dirname, '..', f, `${commandName}.js`))
					];
					this.client.commands.delete(commandName);
					const pull = require(`../${f}/${commandName}.js`);
					this.client.commands.set(commandName, pull);
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField(`**${this.client.user.username} - Reload**`,
							`**◎ Success:** Successfully reloaded \`${commandName}\``);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
					return;
				} catch (e) {
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField(`**${this.client.user.username} - Reload**`,
							`**◎ Error:** Could not reload: \`${args[0].toUpperCase()}\``);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
					return;
				}
			}
		});
	}

};
