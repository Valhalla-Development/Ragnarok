const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Reloads specified command.',
			aliases: ['rl'],
			category: 'Hidden',
			ownerOnly: true
		});
	}

	async run(message, args) {
		const cmd = args[0];
		if (!cmd) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Reload**`,
					`**◎ Error:** Please specify a command to reload!`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const command = this.client.commands.get(cmd) || this.client.commands.get(this.client.aliases.get(cmd));

		if (!command) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Reload**`,
					`**◎ Error:** Could not find command name \`${cmd}\``);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const embed = new MessageEmbed()
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Reload**`,
				`**◎ Success:** Realoading \`${command.name}\``);
		message.channel.send({ embeds: [embed] }).then(async (m) => {
			const startRestart = new Date();

			delete require.cache[require.resolve(`../${command.category}/${ucFirst(command.name)}.js`)];

			const File = require(`../${command.category}/${ucFirst(command.name)}.js`);
			const CommandCre = new File(this.client, command.name.toLowerCase());

			this.client.commands.delete(command.name);
			await this.client.commands.set(command.name, CommandCre);

			const endRestart = new Date();

			const timeInMs = endRestart.getTime() - startRestart.getTime();

			const embedUpd = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Reload**`,
					`**◎ Success:** Command **${command.name}** has been successfully reloaded!\nCommand took \`${timeInMs}\`ms to reload.`);
			m.edit({ embeds: [embedUpd] });
			return;
		});

		function ucFirst(str) {
			if (!str) return str;
			return str[0].toUpperCase() + str.slice(1);
		}
	}

};
