const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const Command = require('../../Structures/Command');
const { version } = require('../../../package.json');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const comCooldown = new Set();
const comCooldownSeconds = 10;

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

		if (command) {
			if (comCooldown.has(message.author.id)) {
				comCooldown.delete(message.author.id);
			}
		}

		if (comCooldown.has(message.author.id)) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Help**`,
					`**◎ Error:** Please only run this command once.`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const embed = new MessageEmbed()
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.setDescription(
				`Hey, I'm [**__Ragnarok__**]! A multi-purpose bot!
				Run \`${prefix}help <command>\` to see command specific instructions
				All commands must be preceded by \`${prefix}\`
				Command Parameters: \`<>\` is strict & \`[]\` is optional
				
				You can run \`${prefix}help all\` to see all commands.`)
			.setAuthor({ name: `${message.guild.name} Help`, iconURL: message.guild.iconURL({ dynamic: true }) })
			.setThumbnail(this.client.user.displayAvatarURL())
			.setFooter({ text: `This guild's prefix is ${prefix} - Bot Version ${version}`, iconURL: this.client.user.avatarURL({ dynamic: true }) });

		if (command === 'all') {
			embed.setDescription(
				`Hey, I'm [**__Ragnarok__**]! A multi-purpose bot!
				Run \`${prefix}help <command>\` to see command specific instructions
				All commands must be preceded by \`${prefix}\`
				Command Parameters: \`<>\` is strict & \`[]\` is optional
							
				You can run \`${prefix}help all\` to see all commands.`);
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

			const row = new MessageActionRow()
				.addComponents(buttonA, buttonB);

			await message.channel.send({ components: [row], embeds: [embed] });
			return;
		}

		if (command) {
			const cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));

			if (!cmd || cmd.category === 'Hidden') {
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
			if (cmd.userPerms.bitfield === 0n) {
				reqPerm = '**◎ Permission Required:** None.';
			} else {
				reqPerm = `**◎ Permission(s) Required:** \`${this.client.utils.formatArray(cmd.userPerms)}\``;
			}

			embed.setAuthor({ name: `${this.client.utils.capitalise(cmd.name)} Command Help`, iconURL: this.client.user.displayAvatarURL() });
			embed.setDescription(
				`**◎ Aliases:** ${cmd.aliases.length ? cmd.aliases.map(alias => `\`${alias}\``).join(' ') : 'No Aliases'}
				**◎ Description:** ${cmd.description}
				**◎ Category:** ${cmd.category}
				**◎ Usage:** ${cmd.usage}
				${reqPerm}`);
			message.channel.send({ embeds: [embed] });
			return;
		} else {
			const buttonA = new MessageButton()
				.setStyle('PRIMARY')
				.setLabel('Economy')
				.setCustomId('eco');

			const buttonB = new MessageButton()
				.setStyle('PRIMARY')
				.setLabel('Fun')
				.setCustomId('fun');

			const buttonC = new MessageButton()
				.setStyle('PRIMARY')
				.setLabel('Generators')
				.setCustomId('gens');

			const buttonD = new MessageButton()
				.setStyle('PRIMARY')
				.setLabel('Information')
				.setCustomId('info');

			const buttonE = new MessageButton()
				.setStyle('PRIMARY')
				.setLabel('Moderation')
				.setCustomId('mod');

			const buttonG = new MessageButton()
				.setStyle('PRIMARY')
				.setLabel('Ticket')
				.setCustomId('ticket');

			const home = new MessageButton()
				.setCustomId('home')
				.setEmoji('🏠')
				.setStyle('SUCCESS')
				.setDisabled(true);

			const inv = new MessageButton()
				.setStyle('LINK')
				.setLabel('Invite Me')
				.setURL('https://discordapp.com/oauth2/authorize?client_id=508756879564865539&scope=bot%20applications.commands&permissions=1514550062326');

			const supp = new MessageButton()
				.setStyle('LINK')
				.setLabel('Support Server')
				.setURL('https://discord.gg/Q3ZhdRJ');

			const support = new MessageButton()
				.setStyle('LINK')
				.setLabel('🍕 Buy me a Pizza')
				.setURL('https://www.buymeacoffee.com/ragnarlothbrok');

			const row = new MessageActionRow()
				.addComponents(home, buttonA, buttonB, buttonC, buttonD);

			const row2 = new MessageActionRow()
				.addComponents(buttonE, buttonG, inv, supp, support);

			const m = await message.channel.send({ components: [row, row2], embeds: [embed] });

			const filter = (but) => but.user.id !== this.client.user.id;

			const collector = m.createMessageComponentCollector({ filter: filter, time: 15000 });

			if (!comCooldown.has(message.author.id)) {
				comCooldown.add(message.author.id);
			}
			setTimeout(() => {
				if (comCooldown.has(message.author.id)) {
					comCooldown.delete(message.author.id);
				}
			}, comCooldownSeconds * 1000);

			collector.on('collect', async b => {
				if (b.user.id !== message.author.id) {
					const wrongUser = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Help**`,
							`**◎ Error:** Only the command executor can select an option!`);
					b.reply({ embeds: [wrongUser], ephemeral: true });
					return;
				}

				collector.resetTimer();

				if (b.customId === 'home') {
					home.setDisabled(true);

					const rowNew = new MessageActionRow()
						.addComponents(home, buttonA, buttonB, buttonC, buttonD);
					const row2New = new MessageActionRow()
						.addComponents(buttonE, buttonG, inv, supp, support);

					await b.update({ embeds: [embed], components: [rowNew, row2New] });
				}

				if (b.customId === 'eco') {
					home.setDisabled(false);

					const categories = this.client.utils.removeDuplicates(this.client.commands.filter(cmd => cmd.category === 'Economy').map(cmd => cmd.name));

					for (let i = 0; i < categories.length; i++) {
						categories[i] = categories[i][0].toUpperCase() + categories[i].substr(1);
					}

					const eco = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.setDescription(
							`Hey, I'm [**__Ragnarok__**]! A multi-purpose bot!
							Run \`${prefix}help <command>\` to see command specific instructions
							All commands must be preceded by \`${prefix}\`
							Command Parameters: \`<>\` is strict & \`[]\` is optional

							You can run \`${prefix}help all\` to see all commands.`)
						.addField(`**Help - Economy**`, `\`${categories.join(`\`, \``)}\``)
						.setAuthor({ name: `${message.guild.name} Help`, iconURL: message.guild.iconURL({ dynamic: true }) })
						.setThumbnail(this.client.user.displayAvatarURL())
						.setFooter({ text: `This guild's prefix is ${prefix} - Bot Version ${version}`, iconURL: this.client.user.avatarURL({ dynamic: true }) });

					const rowNew = new MessageActionRow()
						.addComponents(home, buttonA, buttonB, buttonC, buttonD);
					const row2New = new MessageActionRow()
						.addComponents(buttonE, buttonG, inv, supp, support);

					await b.update({ embeds: [eco], components: [rowNew, row2New] });
					return;
				}
				if (b.customId === 'fun') {
					home.setDisabled(false);

					const categories = this.client.utils.removeDuplicates(this.client.commands.filter(cmd => cmd.category === 'Fun').map(cmd => cmd.name));

					for (let i = 0; i < categories.length; i++) {
						categories[i] = categories[i][0].toUpperCase() + categories[i].substr(1);
					}
					const fun = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.setDescription(
							`Hey, I'm [**__Ragnarok__**]! A multi-purpose bot!
							Run \`${prefix}help <command>\` to see command specific instructions
							All commands must be preceded by \`${prefix}\`
							Command Parameters: \`<>\` is strict & \`[]\` is optional

							You can run \`${prefix}help all\` to see all commands.`)
						.addField(`**Help - Fun**`, `\`${categories.join(`\`, \``)}\``)
						.setAuthor({ name: `${message.guild.name} Help`, iconURL: message.guild.iconURL({ dynamic: true }) })
						.setThumbnail(this.client.user.displayAvatarURL())
						.setFooter({ text: `This guild's prefix is ${prefix} - Bot Version ${version}`, iconURL: this.client.user.avatarURL({ dynamic: true }) });

					const rowNew = new MessageActionRow()
						.addComponents(home, buttonA, buttonB, buttonC, buttonD);
					const row2New = new MessageActionRow()
						.addComponents(buttonE, buttonG, inv, supp, support);

					await b.update({ embeds: [fun], components: [rowNew, row2New] });
					return;
				}
				if (b.customId === 'gens') {
					home.setDisabled(false);

					const categories = this.client.utils.removeDuplicates(this.client.commands.filter(cmd => cmd.category === 'Generators').map(cmd => cmd.name));

					for (let i = 0; i < categories.length; i++) {
						categories[i] = categories[i][0].toUpperCase() + categories[i].substr(1);
					}
					const gen = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.setDescription(
							`Hey, I'm [**__Ragnarok__**]! A multi-purpose bot!
							Run \`${prefix}help <command>\` to see command specific instructions
							All commands must be preceded by \`${prefix}\`
							Command Parameters: \`<>\` is strict & \`[]\` is optional

							You can run \`${prefix}help all\` to see all commands.`)
						.addField(`**Help - Generators**`, `\`${categories.join(`\`, \``)}\``)
						.setAuthor({ name: `${message.guild.name} Help`, iconURL: message.guild.iconURL({ dynamic: true }) })
						.setThumbnail(this.client.user.displayAvatarURL())
						.setFooter({ text: `This guild's prefix is ${prefix} - Bot Version ${version}`, iconURL: this.client.user.avatarURL({ dynamic: true }) });

					const rowNew = new MessageActionRow()
						.addComponents(home, buttonA, buttonB, buttonC, buttonD);
					const row2New = new MessageActionRow()
						.addComponents(buttonE, buttonG, inv, supp, support);

					await b.update({ embeds: [gen], components: [rowNew, row2New] });
					return;
				}
				if (b.customId === 'info') {
					home.setDisabled(false);

					const categories = this.client.utils.removeDuplicates(this.client.commands.filter(cmd => cmd.category === 'Informative').map(cmd => cmd.name));

					for (let i = 0; i < categories.length; i++) {
						categories[i] = categories[i][0].toUpperCase() + categories[i].substr(1);
					}
					const info = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.setDescription(
							`Hey, I'm [**__Ragnarok__**]! A multi-purpose bot!
							Run \`${prefix}help <command>\` to see command specific instructions
							All commands must be preceded by \`${prefix}\`
							Command Parameters: \`<>\` is strict & \`[]\` is optional

							You can run \`${prefix}help all\` to see all commands.`)
						.addField(`**Help - Informative**`, `\`${categories.join(`\`, \``)}\``)
						.setAuthor({ name: `${message.guild.name} Help`, iconURL: message.guild.iconURL({ dynamic: true }) })
						.setThumbnail(this.client.user.displayAvatarURL())
						.setFooter({ text: `This guild's prefix is ${prefix} - Bot Version ${version}`, iconURL: this.client.user.avatarURL({ dynamic: true }) });

					const rowNew = new MessageActionRow()
						.addComponents(home, buttonA, buttonB, buttonC, buttonD);
					const row2New = new MessageActionRow()
						.addComponents(buttonE, buttonG, inv, supp, support);

					await b.update({ embeds: [info], components: [rowNew, row2New] });
					return;
				}
				if (b.customId === 'mod') {
					home.setDisabled(false);

					const categories = this.client.utils.removeDuplicates(this.client.commands.filter(cmd => cmd.category === 'Moderation').map(cmd => cmd.name));

					for (let i = 0; i < categories.length; i++) {
						categories[i] = categories[i][0].toUpperCase() + categories[i].substr(1);
					}
					const mod = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.setDescription(
							`Hey, I'm [**__Ragnarok__**]! A multi-purpose bot!
							Run \`${prefix}help <command>\` to see command specific instructions
							All commands must be preceded by \`${prefix}\`
							Command Parameters: \`<>\` is strict & \`[]\` is optional

							You can run \`${prefix}help all\` to see all commands.`)
						.addField(`**Help - Moderation**`, `\`${categories.join(`\`, \``)}\``)
						.setAuthor({ name: `${message.guild.name} Help`, iconURL: message.guild.iconURL({ dynamic: true }) })
						.setThumbnail(this.client.user.displayAvatarURL())
						.setFooter({ text: `This guild's prefix is ${prefix} - Bot Version ${version}`, iconURL: this.client.user.avatarURL({ dynamic: true }) });

					const rowNew = new MessageActionRow()
						.addComponents(home, buttonA, buttonB, buttonC, buttonD);
					const row2New = new MessageActionRow()
						.addComponents(buttonE, buttonG, inv, supp, support);

					await b.update({ embeds: [mod], components: [rowNew, row2New] });
					return;
				}
				if (b.customId === 'ticket') {
					home.setDisabled(false);

					const categories = this.client.utils.removeDuplicates(this.client.commands.filter(cmd => cmd.category === 'Ticket').map(cmd => cmd.name));

					for (let i = 0; i < categories.length; i++) {
						categories[i] = categories[i][0].toUpperCase() + categories[i].substr(1);
					}
					const tick = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.setDescription(
							`Hey, I'm [**__Ragnarok__**]! A multi-purpose bot!
							Run \`${prefix}help <command>\` to see command specific instructions
							All commands must be preceded by \`${prefix}\`
							Command Parameters: \`<>\` is strict & \`[]\` is optional

							You can run \`${prefix}help all\` to see all commands.`)
						.addField(`**Help - Ticket**`, `\`${categories.join(`\`, \``)}\``)
						.setAuthor({ name: `${message.guild.name} Help`, iconURL: message.guild.iconURL({ dynamic: true }) })
						.setThumbnail(this.client.user.displayAvatarURL())
						.setFooter({ text: `This guild's prefix is ${prefix} - Bot Version ${version}`, iconURL: this.client.user.avatarURL({ dynamic: true }) });

					const rowNew = new MessageActionRow()
						.addComponents(home, buttonA, buttonB, buttonC, buttonD);
					const row2New = new MessageActionRow()
						.addComponents(buttonE, buttonG, inv, supp, support);

					await b.update({ embeds: [tick], components: [rowNew, row2New] });
					return;
				}
			});

			collector.on('end', (_, reason) => {
				if (comCooldown.has(message.author.id)) {
					comCooldown.delete(message.author.id);
				}

				if (reason === 'time') {
					this.client.utils.messageDelete(m, 0);
					this.client.utils.messageDelete(message, 10000);
					return;
				}
			});

			return;
		}
	}

};
