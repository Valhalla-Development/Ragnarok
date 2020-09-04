const { MessageEmbed } = require('discord.js');
const Command = require('../../Structures/Command');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['halp'],
			description: 'Display command list / command usage.',
			category: 'Informative',
			usage: '[command]'
		});
	}

	async run(message, [command]) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const embed = new MessageEmbed()
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.setAuthor(`${message.guild.name} Help`, message.guild.iconURL({ dynamic: true }))
			.setThumbnail(this.client.user.displayAvatarURL())
			.setFooter(`This guild's prefix is ${prefix}`, this.client.user.avatarURL({ dynamic: true }))
			.setTimestamp();

		if (command) {
			const cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));

			if (!cmd) {
				const embed1 = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Help**`,
						`**◎ Error:** Invalid command name: \`${command}\``);
				message.channel.send(embed1).then((m) => this.client.utils.messageDelete(m, 15000));
				return;
			}

			embed.setAuthor(`${this.client.utils.capitalise(cmd.name)} Command Help`, this.client.user.displayAvatarURL());
			embed.setDescription([
				`**◎ Aliases:** ${cmd.aliases.length ? cmd.aliases.map(alias => `\`${alias}\``).join(' ') : 'No Aliases'}`,
				`**◎ Description:** ${cmd.description}`,
				`**◎ Category:** ${cmd.category}`,
				`**◎ Usage:** ${cmd.usage}`
			]);
			message.channel.send(embed);
			return;
		} else {
			embed.setDescription([
				`Hey, I'm [**__Ragnarok__**]! A multi-purpose bot!`,
				`Run \`${prefix}help <command>\` to see command specific instructions`,
				`All commands must be preceded by \`${prefix}\``,
				`Command Parameters: \`<>\` is strict & \`[]\` is optional`
			]);
			const categories = this.client.utils.removeDuplicates(this.client.commands.filter(cmd => cmd.category !== 'Hidden').map(cmd => cmd.category));

			for (const category of categories) {
				embed.addField(`**${this.client.utils.capitalise(category)} (${this.client.commands.filter(cmd =>
					cmd.category === category).size})**`, this.client.commands.filter(cmd =>
					cmd.category === category).map(cmd => `\`${this.client.utils.capitalise(cmd.name)}\``).join(', '));
			}
			message.channel.send(embed);
			return;
		}
	}

};
