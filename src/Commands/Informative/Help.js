const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const Command = require('../../Structures/Command');
const { version } = require('../../../package.json');
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
			.setFooter(`This guild's prefix is ${prefix} - Bot Version ${version}`, this.client.user.avatarURL({ dynamic: true }));

		if (command) {
			const cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));

			if (!cmd) {
				this.client.utils.messageDelete(message, 10000);

				const embed1 = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Help**`,
						`**◎ Error:** Invalid command name: \`${command}\``);
				message.channel.send({ embeds: [embed1] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			let reqPerm;
			if (cmd.ownerOnly) {
				reqPerm = `**◎ Owner Only:** Yes`;
			}
			if (cmd.userPerms.bitfield === 0) {
				reqPerm = '**◎ Permission Required:** None.';
			} else {
				reqPerm = `**◎ Permission(s) Required:** \`${this.client.utils.formatArray(cmd.userPerms)}\``;
			}

			embed.setAuthor(`${this.client.utils.capitalise(cmd.name)} Command Help`, this.client.user.displayAvatarURL());
			embed.setDescription(
				`**◎ Aliases:** ${cmd.aliases.length ? cmd.aliases.map(alias => `\`${alias}\``).join(' ') : 'No Aliases'}
				**◎ Description:** ${cmd.description}
				**◎ Category:** ${cmd.category}
				**◎ Usage:** ${cmd.usage}
				${reqPerm}`);
			message.channel.send({ embeds: [embed] });
			return;
		} else {
			embed.setDescription(
				`Hey, I'm [**__Ragnarok__**]! A multi-purpose bot!
				Run \`${prefix}help <command>\` to see command specific instructions
				All commands must be preceded by \`${prefix}\`
				Command Parameters: \`<>\` is strict & \`[]\` is optional`);
			const categories = this.client.utils.removeDuplicates(this.client.commands.filter(cmd => cmd.category !== 'Hidden').map(cmd => cmd.category));

			for (const category of categories) {
				embed.addField(`**${this.client.utils.capitalise(category)} (${this.client.commands.filter(cmd =>
					cmd.category === category).size})**`, this.client.commands.filter(cmd =>
					cmd.category === category).map(cmd => `\`${this.client.utils.capitalise(cmd.name)}\``).join(', '));
			}

			const buttonA = new MessageButton()
				.setStyle('LINK')
				.setLabel('Invite Me')
				.setURL('https://discordapp.com/oauth2/authorize?client_id=508756879564865539&scope=bot%20applications.commands&permissions=1580723711');

			const buttonB = new MessageButton()
				.setStyle('LINK')
				.setLabel('Support Server')
				.setURL('https://discord.gg/Q3ZhdRJ');

			const buttonC = new MessageButton()
				.setStyle('LINK')
				.setLabel('Vote For Me')
				.setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ');

			const row = new MessageActionRow()
				.addComponents(buttonA, buttonB, buttonC);

			await message.channel.send({ components: [row], embeds: [embed] });
			return;
		}
	}

};
