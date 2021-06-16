const Command = require('../../Structures/Command');
const { MessageEmbed, Permissions } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const fetch = require('node-fetch');
const isAbsoluteUrl = require('is-absolute-url');
const { MessageButton, MessageActionRow } = require('discord-buttons');
const comCooldown = new Set();
const comCooldownSeconds = 10;
const Canvas = require('canvas');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['conf'],
			description: 'Contains multiple commands to configure the bot.',
			category: 'Moderation',
			usage: '[sub-command]',
			userPerms: ['MANAGE_GUILD'],
			botPerms: ['MANAGE_GUILD']
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);

		const { prefix } = prefixgrab;

		if (comCooldown.has(message.author.id)) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Config**`,
					`**◎ Error:** Please only run this command once.`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// config help
		if (args[0] === undefined) {
			const buttonA = new MessageButton()
				.setStyle('green')
				.setLabel('Ad Prot')
				.setID('ads');

			const buttonB = new MessageButton()
				.setStyle('green')
				.setLabel('Autorole')
				.setID('autorole');

			const buttonC = new MessageButton()
				.setStyle('green')
				.setLabel('Birthday')
				.setID('birthday');

			const buttonD = new MessageButton()
				.setStyle('green')
				.setLabel('Dad')
				.setID('dad');

			const buttonE = new MessageButton()
				.setStyle('green')
				.setLabel('Haste')
				.setID('haste');

			const buttonF = new MessageButton()
				.setStyle('green')
				.setLabel('Invite')
				.setID('invite');

			const buttonG = new MessageButton()
				.setStyle('green')
				.setLabel('Level')
				.setID('level');

			const buttonH = new MessageButton()
				.setStyle('green')
				.setLabel('Logging')
				.setID('logging');

			const buttonI = new MessageButton()
				.setStyle('green')
				.setLabel('Membercount')
				.setID('membercount');

			const buttonJ = new MessageButton()
				.setStyle('green')
				.setLabel('Music')
				.setID('music');

			const buttonK = new MessageButton()
				.setStyle('green')
				.setLabel('Mute')
				.setID('mute');

			const buttonL = new MessageButton()
				.setStyle('green')
				.setLabel('Prefix')
				.setID('prefix');

			const buttonM = new MessageButton()
				.setStyle('green')
				.setLabel('Rolemenu')
				.setID('rolemenu');

			const buttonN = new MessageButton()
				.setStyle('green')
				.setLabel('Tickets')
				.setID('tickets');

			const buttonO = new MessageButton()
				.setStyle('green')
				.setLabel('Welcome')
				.setID('welcome');

			const row = new MessageActionRow()
				.addComponent(buttonA)
				.addComponent(buttonB)
				.addComponent(buttonC)
				.addComponent(buttonD)
				.addComponent(buttonE);

			const row2 = new MessageActionRow()
				.addComponent(buttonF)
				.addComponent(buttonG)
				.addComponent(buttonH)
				.addComponent(buttonI)
				.addComponent(buttonJ);

			const row3 = new MessageActionRow()
				.addComponent(buttonK)
				.addComponent(buttonL)
				.addComponent(buttonM)
				.addComponent(buttonN)
				.addComponent(buttonO);

			const initial = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Config**`,
					`**◎** Click the corresponding button for which module you would like to configure.`)
				.setFooter(`If you would like to use the old config menu, run:${prefix}config old`);

			const m = await message.channel.send({ components: [row, row2, row3], embeds: [initial] });

			const filter = (but) => but.clicker.user.id === message.author.id;

			const collector = m.createButtonCollector(filter, { time: 10000 });

			if (!comCooldown.has(message.author.id)) {
				comCooldown.add(message.author.id);
			}
			setTimeout(() => {
				if (comCooldown.has(message.author.id)) {
					comCooldown.delete(message.author.id);
				}
			}, comCooldownSeconds * 1000);

			collector.on('collect', b => {
				if (comCooldown.has(message.author.id)) {
					comCooldown.delete(message.author.id);
				}

				this.client.utils.messageDelete(m, 0);

				if (b.id === 'ads') {
					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Advert Protection:**
							\u3000\`${prefix}config adsprot <on/off>\` : Toggles advert protection`);
					message.channel.send({ embeds: [embed] });
					return;
				}
				if (b.id === 'autorole') {
					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ AutoRole:**
							\u3000\`${prefix}config autorole <@role>\` : Sets the role users are given when they join the guild`);
					message.channel.send({ embeds: [embed] });
					return;
				}
				if (b.id === 'birthday') {
					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Birthday:**
							\u3000\`${prefix}config birthday channel <#channel>\` : Sets the channel where birthday alerts are sent.
					        \u3000\`${prefix}config birthday role [@role]\` : Sets the (optional) role is pinged when it is someones birthday.`);
					message.channel.send({ embeds: [embed] });
					return;
				}
				if (b.id === 'dad') {
					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Dad Bot:**
							\u3000\`${prefix}config dadbot <on/off>\` : Toggles the Dad bot module`);
					message.channel.send({ embeds: [embed] });
					return;
				}
				if (b.id === 'haste') {
					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Hastebin:**
							\u3000\`${prefix}config haste url <on/off>\` : Toggles the Hastebin URL blocker`);
					message.channel.send({ embeds: [embed] });
					return;
				}
				if (b.id === 'invite') {
					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Invite Manager:**
							\u3000\`${prefix}config invmanager <#channel/off>\` : Toggles the Invite Manager module`);
					message.channel.send({ embeds: [embed] });
					return;
				}
				if (b.id === 'level') {
					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Level System:**
							\u3000\`${prefix}config level <enable/disable>\` : Toggles the Level module`);
					message.channel.send({ embeds: [embed] });
					return;
				}
				if (b.id === 'logging') {
					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Logging:**
							\u3000\`${prefix}config logging <#channel/off>\` : Sets/disables the logging channel`);
					message.channel.send({ embeds: [embed] });
					return;
				}
				if (b.id === 'membercount') {
					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ MemberCount:**
							\u3000\`${prefix}config membercount <on/off>\` : Toggles the member count module`);
					message.channel.send({ embeds: [embed] });
					return;
				}
				if (b.id === 'music') {
					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Music:**
							\u3000\`${prefix}config music role <@role>\` : Sets the DJ role
							\u3000\`${prefix}config music role off\` : Disables the DJ role`);
					message.channel.send({ embeds: [embed] });
					return;
				}
				if (b.id === 'mute') {
					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Mute:**
							\u3000\`${prefix}config mute role <@role>\` : Sets the Mute role
							\u3000\`${prefix}config mute role off\` : Disables the Mute role`);
					message.channel.send({ embeds: [embed] });
					return;
				}
				if (b.id === 'prefix') {
					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Prefix:**
							\u3000\`${prefix}config prefix <prefix>\` : Sets the guild prefix`);
					message.channel.send({ embeds: [embed] });
					return;
				}
				if (b.id === 'rolemenu') {
					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Role Menu:**
							\u3000\`${prefix}config rolemenu add <@role>\` : Sets the rolemenu roles
							\u3000\`${prefix}config rolemenu remove <@role>\` : Removes a role from rolemenu
							\u3000\`${prefix}config rolemenu clear\` : Removes all roles from rolemenu`);
					message.channel.send({ embeds: [embed] });
					return;
				}
				if (b.id === 'tickets') {
					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Tickets:**
							\u3000\`${prefix}config ticket cat <cat name>\` : Sets the ticket category
							\u3000\`${prefix}config ticket log <#channel>\` : Enables ticket logging
							\u3000\`${prefix}config ticket role <@role>\` : Sets custom support role for ticket system`);
					message.channel.send({ embeds: [embed] });
					return;
				}
				if (b.id === 'welcome') {
					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Welcome:**
							\u3000 \`${prefix}config welcome channel <#channel>\` : Sets the welcome channel
							\u3000 \`${prefix}config welcome channel off\` : Disables the welcome message
							\u3000 \`${prefix}config welcome image <url-to-image>\` : Sets custom welcome image
							\u3000 \`${prefix}config welcome image off\` : Disables the custom welcome image`);
					message.channel.send({ embeds: [embed] });
					return;
				}
			});

			collector.on('end', (_, reason) => {
				if (comCooldown.has(message.author.id)) {
					comCooldown.delete(message.author.id);
				}

				if (reason === 'time') {
					this.client.utils.messageDelete(m, 0);
					return;
				}
			});
		}

		if (comCooldown.has(message.author.id)) {
			comCooldown.delete(message.author.id);
		}

		if (args[0] === 'old') {
			const embed = new MessageEmbed()
				.setThumbnail(this.client.user.displayAvatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.setAuthor(`${this.client.user.username} - Config`)
				.setDescription(
					`**◎ Advert Protection:**
					\u3000 \`${prefix}config adsprot <on/off>\` : Toggles advert protection
					\u3000
					**◎ Autorole:**
					\u3000 \`${prefix}config autorole <@role>\` : Sets the role users are given when they join the guild
					\u3000
					**◎ Birthday:**
					\u3000 \`${prefix}config birthday channel <#channel>\` : Sets the channel where birthday alerts are sent.
					\u3000 \`${prefix}config birthday role [@role]\` : Sets the (optional) role is pinged when it is someones birthday.
					\u3000
					**◎ Dad Bot:**
					\u3000 \`${prefix}config dadbot <on/off>\` : Toggles the Dad bot module
					\u3000
					**◎ Hastebin Options:**
					\u3000 \`${prefix}config haste url <on/off>\` : Toggles the Hastebin URL blocker
					\u3000
					**◎ Invite Manager:**
					\u3000 \`${prefix}config invmanager <#channel/off>\` : Toggles the Invite Manager module
					\u3000
					**◎ Level System:**
					\u3000 \`${prefix}config level <enable/disable>\` : Toggles the Level module
					\u3000
					**◎ Logging:**
					\u3000 \`${prefix}config logging <#channel/off>\` : Sets/disables the logging channel
					\u3000
					**◎ Membercount:**
					\u3000 \`${prefix}config membercount <on/off>\` : Toggles the member count module
					\u3000
					**◎ Music:**
					\u3000 \`${prefix}config music role <@role>\` : Sets the DJ role
					\u3000 \`${prefix}config music role off\` : Disables the DJ role
					\u3000
					**◎ Mute:**
					\u3000 \`${prefix}config mute role <@role>\` : Sets the Mute role
					\u3000 \`${prefix}config mute role off\` : Disables the Mute role
					\u3000
					**◎ Prefix:**
					\u3000 \`${prefix}config prefix <prefix>\` : Sets the guild prefix
					\u3000
					**◎ Rolemenu:**
					\u3000 \`${prefix}config rolemenu add <@role>\` : Sets the rolemenu roles
					\u3000 \`${prefix}config rolemenu remove <@role>\` : Removes a role from rolemenu
					\u3000 \`${prefix}config rolemenu clear\` : Removes all roles from rolemenu
					\u3000
					**◎ Tickets:**
					\u3000 \`${prefix}config ticket cat <cat name>\` : Sets the ticket category
					\u3000 \`${prefix}config ticket log <#channel>\` : Enables ticket logging
					\u3000 \`${prefix}config ticket role <@role>\` : Sets custom support role for ticket system
					\u3000
					**◎ Welcome:**
					\u3000 \`${prefix}config welcome channel <#channel>\` : Sets the welcome channel
					\u3000 \`${prefix}config welcome channel off\` : Disables the welcome message
					\u3000 \`${prefix}config welcome image <url-to-image>\` : Sets custom welcome image
					\u3000 \`${prefix}config welcome image off\` : Disables the custom welcome image
					\u3000`)
				.setTimestamp();
			message.channel.send({ embeds: [embed] });
			return;
		}

		// Birthday config
		if (args[0] === 'birthday') {
			this.client.getTable = db.prepare('SELECT * FROM birthdayConfig WHERE guildid = ?');

			let status;
			if (message.guild.id) {
				status = this.client.getTable.get(message.guild.id);

				if (args[1] === undefined) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Error:** Available options are:\n\`${prefix}config birthday channel <#channel>\` : Sets the channel where birthday alerts are sent.\n\`${prefix}config birthday role [@role]\` : Sets the (optional) role is pinged when it is someones birthday.\nor \`${prefix}config birthday off\``);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				if (args[1] === 'off') {
					if (!status) {
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Error:** Birthday function is already disabled!`);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					}

					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Success:** Birthday function disabled!`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					db.prepare('DELETE FROM birthdayConfig WHERE guildid = ?').run(message.guild.id);
					return;
				}

				if (args[1] === 'channel') {
					const lchan = message.mentions.channels.first();

					if (args[2] === undefined) {
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Error:** Please mention a channel!`);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					}

					if (!lchan) {
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Error:** Ensure you are tagging a valid channel, I had difficulty locating ${lchan}`);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					} else if (!status) {
						const insert = db.prepare('INSERT INTO birthdayConfig (guildid, channel) VALUES (@guildid, @channel);');
						insert.run({
							guildid: `${message.guild.id}`,
							channel: `${lchan.id}`
						});
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Success:** Birthday channel is now set to ${lchan}`);
						message.channel.send({ embeds: [embed] });
					} else {
						const update = db.prepare('UPDATE birthdayConfig SET channel = (@channel) WHERE guildid = (@guildid);');
						update.run({
							guildid: `${message.guild.id}`,
							channel: `${lchan.id}`
						});
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Success:** Birthday channel updated to ${lchan}`);
						message.channel.send({ embeds: [embed] });
					}
				}

				if (args[1] === 'role') {
					if (!status) {
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Error:** Please set a channel before setting the role! You can do this by running: \`${prefix}config birthday channel #channel\``);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					}

					const role = message.mentions.roles.first();

					if (!role) {
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Error:** A role must be mentioned`);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					}

					const update = db.prepare('UPDATE birthdayConfig SET role = (@role) WHERE guildid = (@guildid);');
					update.run({
						guildid: `${message.guild.id}`,
						role: `${role.id}`
					});

					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Success:** Birthday Role updated to ${role}`);
					message.channel.send({ embeds: [embed] });
				}
			}
		}

		// Level toggle
		if (args[0] === 'level') {
			this.client.getTable = db.prepare('SELECT * FROM level WHERE guildid = ?');

			let status;
			if (message.guild.id) {
				status = this.client.getTable.get(message.guild.id);

				if (args[1] === undefined) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Error:** Available options are: \`${prefix}config level enable\` or \`${prefix}config level disable\``);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				if (args[1] === 'disable') {
					if (status) {
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Error:** Level system is already disabled!`);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					}

					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Success:** Level system disabled!`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					const insert = db.prepare('INSERT INTO level (guildid, status) VALUES (@guildid, @status);');
					insert.run({
						guildid: `${message.guild.id}`,
						status: 'disabled'
					});
					return;
				}
				if (args[1] === 'enable') {
					if (!status) {
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Error:** Level system is already enabled!`);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					}

					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Success:** Level system enabled!`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					db.prepare('DELETE FROM level WHERE guildid = ?').run(message.guild.id);
					return;
				}
			}
		}

		// Membercount Command
		if (args[0] === 'membercount') {
			// preparing count
			this.client.getTable = db.prepare('SELECT * FROM membercount WHERE guildid = ?');
			let status;
			if (message.guild.id) {
				status = this.client.getTable.get(message.guild.id);

				if (args[1] === 'on') {
					// if already on
					if (status) {
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Error:** Member count module is already enabled on this guild! To disable it, please use \`${prefix}config membercount <off>\``);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					}

					message.guild.channels.create('Member Count', {
						type: 'category', reason: 'member count category'
					}).then((a) => {
						a.setPosition(0);

						message.guild.channels.create(`Users: ${(message.guild.memberCount - message.guild.members.cache.filter((m) => m.user.bot).size).toLocaleString('en')}`, {
							type: 'voice',
							permissionOverwrites: [{
								id: message.channel.guild.roles.everyone.id,
								deny: 'CONNECT',
								allow: 'VIEW_CHANNEL'
							}],
							reason: 'user count channel'
						}).then((b) => {
							b.setParent(a);

							message.guild.channels.create(`Bots: ${message.guild.members.cache.filter((m) => m.user.bot).size}`, {
								type: 'voice',
								permissionOverwrites: [{
									id: message.channel.guild.roles.everyone.id,
									deny: 'CONNECT',
									allow: 'VIEW_CHANNEL'
								}],
								reason: 'bot count channel'
							}).then((c) => {
								c.setParent(a);

								message.guild.channels.create(`Total: ${message.guild.memberCount.toLocaleString('en')}`, {
									type: 'voice',
									permissionOverwrites: [{
										id: message.channel.guild.roles.everyone.id,
										deny: 'CONNECT',
										allow: 'VIEW_CHANNEL'
									}],
									reason: 'total count channel'
								}).then((d) => {
									d.setParent(a);

									const insert = db.prepare('INSERT INTO membercount (guildid, status, channela, channelb, channelc) VALUES (@guildid, @status, @channela, @channelb, @channelc);');
									insert.run({
										guildid: `${message.guild.id}`,
										status: 'on',
										channela: b.id,
										channelb: c.id,
										channelc: d.id
									});
								});
							});
						});
					});

					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Success:** Member count was enabled`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));

					// if args = off
				} else if (args[1] === 'off') {
					// if already off
					if (!status) {
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Error:** Member protection is not enabled on this guild! To activate it, please use \`${prefix}config membercount <on>\``);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					}

					const channelA = this.client.channels.cache.find((a) => a.id === status.channela);
					const channelB = this.client.channels.cache.find((b) => b.id === status.channelb);
					const channelC = this.client.channels.cache.find((c) => c.id === status.channelc);

					const catA = message.guild.channels.cache.find((d) => d.name === 'Member Count');
					if (channelA) channelA.delete();
					if (channelB) channelB.delete();
					if (channelC) channelC.delete();
					if (catA) catA.delete();
					db.prepare('DELETE FROM membercount WHERE guildid = ?').run(message.guild.id);

					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Success:** Member count was turned off!`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				} else if (args[1] !== 'off' || args[1] !== 'on') {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Error:** Correct usage: \`${prefix}config membercount <on/off>\``);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}
			}
		}

		// Rolemenu Command
		if (args[0] === 'rolemenu') {
			// Rolemenu Config
			if (args[1] === 'add') {
				const roleList = [];
				if (message.mentions.roles.size <= 0) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Error:** You must mention a role to remove from the menu.`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				const foundRoleMenu = db.prepare(`SELECT * FROM rolemenu WHERE guildid=${message.guild.id}`).get();
				if (!foundRoleMenu) {
					message.mentions.roles.forEach((role) => {
						roleList.push(role.id);
					});
					const newRoleMenu = db.prepare('INSERT INTO rolemenu (guildid, roleList) VALUES (@guildid, @roleList);');
					newRoleMenu.run({
						guildid: `${message.guild.id}`,
						roleList: JSON.stringify(roleList)
					});

					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Success:** Roles successfully set in the assignable role menu!`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				} else {
					const foundRoleList = JSON.parse(foundRoleMenu.roleList);
					message.mentions.roles.forEach((role) => {
						if (!foundRoleList.includes(role.id)) {
							foundRoleList.push(role.id);
						}
					});
					const updateRoleMenu = db.prepare(`UPDATE rolemenu SET roleList = (@roleList) WHERE guildid=${message.guild.id}`);
					updateRoleMenu.run({
						roleList: JSON.stringify(foundRoleList)
					});

					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Success:** Roles successfully set in the assignable role menu!`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				}
				return;
			}
			if (args[1] === 'remove') {
				if (message.mentions.roles.size <= 0) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Error:** You must mention a role to remove from the menu.`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				const mentions = message.mentions.roles.map((role) => role.id);

				const foundRoleMenu = db.prepare(`SELECT * FROM rolemenu WHERE guildid = ${message.guild.id}`).get();
				const roleList = JSON.parse(foundRoleMenu.roleList);

				for (const role of mentions) {
					if (roleList.includes(role)) {
						const index = roleList.indexOf(role);
						roleList.splice(index, 1);
						const updateRoleList = db.prepare('UPDATE rolemenu SET roleList = (@roleList) WHERE guildid = (@guildid)');
						updateRoleList.run({
							guildid: `${message.guild.id}`,
							roleList: JSON.stringify(roleList)
						});
					}
				}

				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Config**`,
						`**◎ Success:** Specified roles have successfully been cleagreen from the rolemenu!`);
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
			if (args[1] === 'clear') {
				this.client.utils.messageDelete(message, 10000);

				db.prepare(`DELETE FROM rolemenu WHERE guildid=${message.guild.id}`).run();
				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Config**`,
						`**◎ Success:** All roles have successfully been cleagreen from the rolemenu!`);
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Config**`,
					`**◎ Error:** Please use \`${prefix}config\` to see available commands!`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// hastebin
		if (args[0] === 'haste') {
			// preparing count
			this.client.getTable = db.prepare('SELECT * FROM hastebin WHERE guildid = ?');
			let status;
			if (message.guild.id) {
				status = this.client.getTable.get(message.guild.id);

				if (args[1] === 'url') {
					if (args[2] === 'on') {
						// if already on
						if (status) {
							this.client.utils.messageDelete(message, 10000);

							const embed = new MessageEmbed()
								.setColor(this.client.utils.color(message.guild.me.displayHexColor))
								.addField(`**${this.client.user.username} - Config**`,
									`**◎ Error:** Hastebin URL blocker is already enabled on this guild! To disable it, please use \`${prefix}config haste url <off>\``);
							message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
							return;
						}
						const insert = db.prepare('INSERT INTO hastebin (guildid, status) VALUES (@guildid, @status);');
						insert.run({
							guildid: `${message.guild.id}`,
							status: 'on'
						});

						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Success:** Hastebin URL blocker was enabled.`);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));

						// if args = off
					} else if (args[2] === 'off') {
						// if already off
						if (!status) {
							this.client.utils.messageDelete(message, 10000);

							const embed = new MessageEmbed()
								.setColor(this.client.utils.color(message.guild.me.displayHexColor))
								.addField(`**${this.client.user.username} - Config**`,
									`**◎ Error:** Hastebin URL blocker is not enabled on this guild! To activate it, please use \`${prefix}config haste url <on>\``);
							message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
							return;
						}

						this.client.utils.messageDelete(message, 10000);

						db.prepare('DELETE FROM hastebin WHERE guildid = ?').run(message.guild.id);
						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Success:** Hastebin URL blocker was disabled!`);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					} else if (args[2] !== 'off' || args[2] !== 'on') {
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Error:** Correct usage \`${prefix}config haste inv <on/off>\``);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					}
				}
			}
		}

		// dadbot
		if (args[0] === 'dadbot') {
			// preparing count
			this.client.getTable = db.prepare('SELECT * FROM dadbot WHERE guildid = ?');
			let status;
			if (message.guild.id) {
				status = this.client.getTable.get(message.guild.id);

				if (args[1] === 'on') {
					// if already on
					if (status) {
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Error:** Dad bot is already enabled on this guild! To disable it, please use \`${prefix}config dadbot <off>\``);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					}
					const insert = db.prepare('INSERT INTO dadbot (guildid, status) VALUES (@guildid, @status);');
					insert.run({
						guildid: `${message.guild.id}`,
						status: 'on'
					});

					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Success:** Dad bot was enabled`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));

					// if args = off
				} else if (args[1] === 'off') {
					// if already off
					if (!status) {
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Error:** Dad bot is not enabled on this guild! To activate it, please use \`${prefix}config dadbot <on>\``);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					}

					this.client.utils.messageDelete(message, 10000);

					db.prepare('DELETE FROM dadbot WHERE guildid = ?').run(message.guild.id);
					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Success:** Dad bot was disabled!`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				} else if (args[1] !== 'off' || args[1] !== 'on') {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Error:** Correct usage \`${prefix}config dadbot <on/off>\``);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}
			}
		}

		// adsprot
		if (args[0] === 'adsprot') {
			// perms checking
			if (!message.member.guild.me.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
				this.client.utils.messageDelete(message, 10000);

				const npPerms = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Ads Protection**`,
						`**◎ Error:** I need to have the \`MANAGE_MESSAGES\` permission for this function.`);
				message.channel.send({ embeds: [npPerms] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}


			// preparing count
			this.client.getTable = db.prepare('SELECT * FROM adsprot WHERE guildid = ?');
			let status;
			if (message.guild.id) {
				status = this.client.getTable.get(message.guild.id);

				if (args[1] === 'on') {
					// if already on
					if (status) {
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Error:** Advert protection is already enabled on this guild! To disable it, please use \`${prefix}config adsprot <off>\``);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					}

					const insert = db.prepare('INSERT INTO adsprot (guildid, status) VALUES (@guildid, @status);');
					insert.run({
						guildid: `${message.guild.id}`,
						status: 'on'
					});
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Success:** Advert protection was enabled`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));

					// if args = off
				} else if (args[1] === 'off') {
					// if already off
					if (!status) {
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Error:** Advert protection is not enabled on this guild! To activate it, please use \${prefix}config adsprot <on>\``);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					}

					this.client.utils.messageDelete(message, 10000);

					db.prepare('DELETE FROM adsprot WHERE guildid = ?').run(message.guild.id);
					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Success:** Advert protection was disabled`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				} else if (args[1] !== 'off' || args[1] !== 'on') {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Error:** Please use \`${prefix}config adsprot <on/off>\``);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}
			}
		}

		// autorole
		if (args[0] === 'autorole') {
			this.client.getTable = db.prepare('SELECT * FROM autorole WHERE guildid = ?');
			let role;
			if (message.guild.id) {
				role = this.client.getTable.get(message.guild.id);

				if (!args[1]) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Error:** Please use \`${prefix}config autorole <role>\` __the role is case sensitive!__`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}
				if (args[1] === 'off') {
					this.client.utils.messageDelete(message, 10000);

					db.prepare('DELETE FROM autorole WHERE guildid = ?').run(message.guild.id);
					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Success:** Autorole disabled!`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}
				if (!message.guild.roles.cache.some((r) => [`${args[1]}`].includes(r.name))) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Error:** That role does not exist! Roles are case sensitive. (You do not tag the role, simply write the name of the role)`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}
				if (role) {
					const update = db.prepare('UPDATE autorole SET role = (@role) WHERE guildid = (@guildid);');
					update.run({
						guildid: `${message.guild.id}`,
						role: `${args[1]}`
					});
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Success:** Autorole updated to \`${args[1]}\`!`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				const insert = db.prepare('INSERT INTO autorole (guildid, role) VALUES (@guildid, @role);');
				insert.run({
					guildid: `${message.guild.id}`,
					role: `${args[1]}`
				});
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Config**`,
						`**◎ Success:** Autorole set to \`${args[1]}\`!`);
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
		}

		// logging

		if (args[0] === 'logging') {
			if (!message.member.guild.me.permissions.has(Permissions.FLAGS.VIEW_AUDIT_LOG)) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Config**`,
						`**◎ Error:** I need the permission \`View Audit Log\` for this command!`);
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
			this.client.getTable = db.prepare('SELECT * FROM logging WHERE guildid = ?');

			const lchan = message.mentions.channels.first();

			let status;
			if (message.guild.id) {
				status = this.client.getTable.get(message.guild.id);

				if (args[1] === undefined) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Error:** Please mention a channel!`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				if (args[1] === 'off') {
					// to turn logging off
					if (!status) {
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Error:** Logging is already disabled!`);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					}

					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Success:** Logging disabled!`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					db.prepare('DELETE FROM logging WHERE guildid = ?').run(message.guild.id);
					return;
				}
				if (!lchan) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Error:** Check if the entegreen channel's name is correct and then type the command again.`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}
				if (lchan.type === 'voice' || lchan.type === 'category') {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Error:** Check if the entegreen text channel's name is correct and then type the command again.`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}
				if (!status) {
					const insert = db.prepare('INSERT INTO logging (guildid, channel) VALUES (@guildid, @channel);');
					insert.run({
						guildid: `${message.guild.id}`,
						channel: `${lchan.id}`
					});
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Success:** Logging set to ${lchan}`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				const update = db.prepare('UPDATE logging SET channel = (@channel) WHERE guildid = (@guildid);'
				);
				update.run({
					guildid: `${message.guild.id}`,
					channel: `${lchan.id}`
				});
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Config**`,
						`**◎ Success:** Logging updated to ${lchan}`);
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
		}

		// ticket cat and log and role
		if (args[0] === 'ticket') {
			if (args[1] === 'cat') {
				this.client.getTable = db.prepare('SELECT category FROM ticketConfig WHERE guildid = ?');

				const category = message.guild.channels.cache.find(
					(c) => c.name === args.slice(2).join(' ') && c.type === 'category'
				);

				let status;
				if (message.guild.id) {
					status = this.client.getTable.get(message.guild.id);

					if (args[2] === undefined) {
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Error:** Please type the name of the category!`);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					}

					if (args[2] === 'off') {
						// to turn logging off
						if (!status) {
							this.client.utils.messageDelete(message, 10000);

							const embed = new MessageEmbed()
								.setColor(this.client.utils.color(message.guild.me.displayHexColor))
								.addField(`**${this.client.user.username} - Config**`,
									`**◎ Error:** Ticket Category is already disabled!`);
							message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
							return;
						}

						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Success:** Ticket Category disabled!`);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						db.prepare('UPDATE ticketConfig SET category = (@cat) WHERE guildid = (@guildid);').run({
							guildid: `${message.guild.id}`,
							cat: null
						});
						return;
					}
					if (!category) {
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Error:** Check if the entegreen categories name is correct and then type the command again. (The name is case sensitive!`);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					}
					if (!status) {
						const insert = db.prepare('INSERT INTO ticketConfig (guildid, category) VALUES (@guildid, @category);');
						insert.run({
							guildid: `${message.guild.id}`,
							category: `${category.id}`
						});
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Success:** Ticket Category set to \`${category.name}\``);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					}

					const update = db.prepare('UPDATE ticketConfig SET category = (@category) WHERE guildid = (@guildid);');
					update.run({
						guildid: `${message.guild.id}`,
						category: `${category.id}`
					});
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Success:** Ticket Category updated to \`${category.name}\``);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}
			} else if (args[1] === 'log') {
				this.client.getTable = db.prepare('SELECT log FROM ticketConfig WHERE guildid = ?');

				const lchan = message.mentions.channels.first();

				let status;
				if (message.guild.id) {
					status = this.client.getTable.get(message.guild.id);

					if (args[2] === undefined) {
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Error:** Please mention a channel!`);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					}

					if (args[2] === 'off') {
						// to turn logging off
						if (!status) {
							this.client.utils.messageDelete(message, 10000);

							const embed = new MessageEmbed()
								.setColor(this.client.utils.color(message.guild.me.displayHexColor))
								.addField(`**${this.client.user.username} - Config**`,
									`**◎ Error:** Ticket Logging is already disabled!`);
							message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
							return;
						}

						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Success:** Ticket Logging disabled!`);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						db.prepare('UPDATE ticketConfig SET log = (@log) WHERE guildid = (@guildid)').run({
							guildid: message.guild.id,
							log: null
						});
						return;
					}
					if (!lchan) {
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Error:** Check if the entegreen categories name is correct and then type the command again. (The name is case sensitive!`);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					}
					if (!status) {
						const insert = db.prepare('INSERT INTO ticketConfig (guildid, log) VALUES (@guildid, @channel);');
						insert.run({
							guildid: `${message.guild.id}`,
							channel: `${lchan.id}`
						});
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Success:** Ticket Logging set to ${lchan}`);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					}

					const update = db.prepare('UPDATE ticketConfig SET log = (@log) WHERE guildid = (@guildid);');
					update.run({
						guildid: `${message.guild.id}`,
						log: `${lchan.id}`
					});
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Success:** Ticket Logging updated to ${lchan}`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}
			} else if (args[1] === 'role') {
				this.client.getTable = db.prepare('SELECT role FROM ticketConfig WHERE guildid = ?');
				const status = this.client.getTable.get(message.guild.id);

				const suppRole = message.mentions.roles.first();

				if (message.mentions.roles.size <= 0 && args[2] !== 'off') {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Error:** A role must be mentioned`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}
				if (args[2] === 'off') {
					const update = db.prepare('UPDATE ticketConfig SET role = (@role) WHERE guildid = (@guildid)');
					update.run({
						guildid: `${message.guild.id}`,
						role: null
					});
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Success:** Custom Support Role disabled!`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}
				if (!status) {
					const update = db.prepare('INSERT INTO ticketConfig (role, guildid) VALUES (@role, @guildid);');
					update.run({
						guildid: `${message.guild.id}`,
						role: `${suppRole.id}`
					});
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Success:** Support Role updated to ${suppRole}`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				const update = db.prepare('UPDATE ticketConfig SET role = (@role) WHERE guildid = (@guildid);');
				update.run({
					guildid: `${message.guild.id}`,
					role: `${suppRole.id}`
				});
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Config**`,
						`**◎ Success:** Support Role updated to ${suppRole}`);
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
		}

		// setprefix

		if (args[0] === 'prefix') {
			const talkedRecently = new Set();

			if (talkedRecently.has(message.author.id)) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Config**`,
						`**◎ Error:** Wait 1 minute before changing the prefix again.`);
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			} else {
				talkedRecently.add(message.author.id);
				setTimeout(() => {
					talkedRecently.delete(message.author.id);
				}, 60000);
			}

			this.client.getTable = db.prepare('SELECT * FROM setprefix WHERE guildid = ?');

			if (args[1] === 'off') {
				const off = db.prepare('UPDATE setprefix SET prefix = (\'-\') WHERE guildid = (@guildid);');
				off.run({
					guildid: `${message.guild.id}`
				});
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Config**`,
						`**◎ Success:** Custom prefix disabled!`);
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
			if (args[1] === '[' || args[1] === '{' || args[1] === ']' || args[1] === '}' || args[1] === ':') {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Config**`,
						`**◎ Error:** Please choose another prefix.`);
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			if (!args[1]) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Config**`,
						`**◎ Error:** Incorrect usage!`);
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			if (prefix) {
				const update = db.prepare('UPDATE setprefix SET prefix = (@prefix) WHERE guildid = (@guildid);');
				update.run({
					guildid: `${message.guild.id}`,
					prefix: `${args[1]}`
				});
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Config**`,
						`**◎ Success:** Prefix updated!`);
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			const insert = db.prepare('INSERT INTO setprefix (guildid, prefix) VALUES (@guildid, @prefix);');
			insert.run({
				guildid: `${message.guild.id}`,
				prefix: `${args[1]}`
			});
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Config**`,
					`**◎ Success:** Prefix set!`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// setwelcome

		if (args[0] === 'welcome') {
			if (args[1] === undefined) {
				const embed = new MessageEmbed()
					.setThumbnail(this.client.user.displayAvatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField('Ragnarok',
						`**◎ Set Welcome:** To set the welcome channel, the command is \`${prefix}config welcome channel <#channel>\`\nTo disable the welcome, use \`${prefix}config welcome channel off\``)
					.setTimestamp();
				message.channel.send({ embeds: [embed] });
				return;
			}
			if (args[1] === 'image') {
				this.client.getTable = db.prepare('SELECT * FROM setwelcome WHERE guildid = ?');

				let status;
				if (message.guild.id) {
					status = this.client.getTable.get(message.guild.id);

					if (args[2] === 'off') {
						if (!status.image) {
							this.client.utils.messageDelete(message, 10000);

							const embed = new MessageEmbed()
								.setColor(this.client.utils.color(message.guild.me.displayHexColor))
								.addField(`**${this.client.user.username} - Config**`,
									`**◎ Error:** You have no custom image enabled!`);
							message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
							return;
						} else {
							const update = db.prepare('UPDATE setwelcome SET image = (@image) WHERE guildid = (@guildid);');
							update.run({
								guildid: `${message.guild.id}`,
								image: null
							});

							this.client.utils.messageDelete(message, 10000);

							const embed = new MessageEmbed()
								.setColor(this.client.utils.color(message.guild.me.displayHexColor))
								.addField(`**${this.client.user.username} - Config**`,
									`**◎ Success:** Custom image has been disabled!`);
							message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
							return;
						}
					}

					if (!args[2]) {
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Error:** Incorrect Usage! An example of this command would be: \`${prefix}config welcome image <url-to-image>\` or to disable: \`${prefix}config welcome image off\``);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					}

					const urlExtension = args[2].substring(args[2].lastIndexOf('.') + 1);
					const validExtensions = ['jpg', 'jpeg', 'png'];

					if (!validExtensions.includes(urlExtension)) {
						this.client.utils.messageDelete(message, 10000);

						const invalidExt = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Error:** \`.${urlExtension}\` is not a valid image type!\n\n**Acceptable files:**\n\`${validExtensions.join(', ')}\``);
						message.channel.send({ embeds: [invalidExt] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					}

					if (!isAbsoluteUrl(args[2])) {
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Error:** Please enter a valid URL, the URL must be absolute! An example of an absolute URL would be: https://www.google.com`);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					}

					await fetch(args[2])
						.then(async res => {
							if (res.ok) {
								if (!status) {
									this.client.utils.messageDelete(message, 10000);

									const embed = new MessageEmbed()
										.setColor(this.client.utils.color(message.guild.me.displayHexColor))
										.addField(`**${this.client.user.username} - Config**`,
											`**◎ Error:** You must enable the welcome module first! You can do this by running the following command. \`${prefix}config welcome channel <#channel>\``);
									message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
									return;
								} else {
									try {
										await Canvas.loadImage(args[2]);
									} catch {
										this.client.utils.messageDelete(message, 10000);

										const invalidExt = new MessageEmbed()
											.setColor(this.client.utils.color(message.guild.me.displayHexColor))
											.addField(`**${this.client.user.username} - Config**`,
												`**◎ Error:** I was unable to process \`${args[2]}\`\nIs it a valid image?`);
										message.channel.send({ embeds: [invalidExt] }).then((m) => this.client.utils.deletableCheck(m, 10000));
										return;
									}

									const update = db.prepare('UPDATE setwelcome SET image = (@image) WHERE guildid = (@guildid);');
									update.run({
										guildid: `${message.guild.id}`,
										image: args[2]
									});
									this.client.utils.messageDelete(message, 0);

									const embed = new MessageEmbed()
										.setColor(this.client.utils.color(message.guild.me.displayHexColor))
										.setImage(args[2])
										.addField(`**${this.client.user.username} - Config**`,
											`**◎ Success:** Image has been updated to the following.`);
									message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
									return;
								}
							} else {
								this.client.utils.messageDelete(message, 10000);

								const embed = new MessageEmbed()
									.setColor(this.client.utils.color(message.guild.me.displayHexColor))
									.addField(`**${this.client.user.username} - Config**`,
										`**◎ Error:** Please enter a valid image URL! The end of the URL must end with one of the supported extensions. (\`.jpg, .jpeg, .png\`)`);
								message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
								return;
							}
						});

					return;
				}
			}

			if (args[1] === 'channel') {
				this.client.getTable = db.prepare('SELECT * FROM setwelcome WHERE guildid = ?');

				const lchan = message.mentions.channels.first();

				let status;
				if (message.guild.id) {
					status = this.client.getTable.get(message.guild.id);

					if (args[2] === undefined) {
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Error:** Please mention a channel!`);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					}

					if (args[2] === 'off') {
						// to turn logging off
						if (!status) {
							this.client.utils.messageDelete(message, 10000);

							const embed = new MessageEmbed()
								.setColor(this.client.utils.color(message.guild.me.displayHexColor))
								.addField(`**${this.client.user.username} - Config**`,
									`**◎ Error:** Welcome channel is already disabled!`);
							message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						} else {
							this.client.utils.messageDelete(message, 10000);

							const embed = new MessageEmbed()
								.setColor(this.client.utils.color(message.guild.me.displayHexColor))
								.addField(`**${this.client.user.username} - Config**`,
									`**◎ Success:** Welcome channel disabled!`);
							message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
							db.prepare('DELETE FROM setwelcome WHERE guildid = (@guildid)').run({
								guildid: message.guild.id
							});
						}
					} else if (!lchan) {
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Error:** Check if the entegreen categories name is correct and then type the command again. (The name is case sensitive!`);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					} else if (!status) {
						const insert = db.prepare('INSERT INTO setwelcome (guildid, channel) VALUES (@guildid, @channel);');
						insert.run({
							guildid: `${message.guild.id}`,
							channel: `${lchan.id}`
						});
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Success:** Welcome channel is now set to ${lchan}`);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					} else {
						const update = db.prepare('UPDATE setwelcome SET channel = (@channel) WHERE guildid = (@guildid);');
						update.run({
							guildid: `${message.guild.id}`,
							channel: `${lchan.id}`
						});
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Success:** Welcome channel updated to ${lchan}`);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					}
				}
			}
		}
		// Music
		if (args[0] === 'music') {
			if (args[1] === undefined) {
				const embed = new MessageEmbed()
					.setThumbnail(this.client.user.displayAvatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField('Ragnarok',
						`**◎ Music:** To set the music role, the command is \`${prefix}config music role <@role>\`\nTo disable the role, use \`${prefix}config music role off\``)
					.setTimestamp();
				message.channel.send({ embeds: [embed] });
				return;
			}
			if (args[1] === 'role') {
				this.client.getTable = db.prepare('SELECT * FROM music WHERE guildid = ?');

				let status;
				if (message.guild.id) {
					status = this.client.getTable.get(message.guild.id);

					const djRole = message.mentions.roles.first();

					if (message.mentions.roles.size <= 0 && args[2] !== 'off') {
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Error:** A role must be mentioned`);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					}
					if (args[2] === 'off') {
						const update = db.prepare('UPDATE music SET role = (@role) WHERE guildid = (@guildid)');
						update.run({
							guildid: `${message.guild.id}`,
							role: null
						});
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Success:** Custom DJ Role disabled!`);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					}

					if (!status) {
						const update = db.prepare('INSERT INTO music (role, guildid) VALUES (@role, @guildid);');
						update.run({
							guildid: `${message.guild.id}`,
							role: `${djRole.id}`
						});
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Success:** DJ Role updated to ${djRole}`);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					}

					const update = db.prepare('UPDATE music SET role = (@role) WHERE guildid = (@guildid);');
					update.run({
						guildid: `${message.guild.id}`,
						role: `${djRole.id}`
					});
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Success:** DJ Role updated to ${djRole}`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				}
			}
		}

		// Mute
		if (args[0] === 'mute') {
			if (args[1] === undefined) {
				const embed = new MessageEmbed()
					.setThumbnail(this.client.user.displayAvatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField('Ragnarok',
						`**◎ Mute:** To set the Mute role, the command is \`${prefix}config mute role <@role>\`\nTo disable the role, use \`${prefix}config mute role off\``)
					.setTimestamp();
				message.channel.send({ embeds: [embed] });
				return;
			}
			if (args[1] === 'role') {
				this.client.getTable = db.prepare('SELECT * FROM muterole WHERE guildid = ?');

				let status;
				if (message.guild.id) {
					status = this.client.getTable.get(message.guild.id);

					const muteRole = message.mentions.roles.first();

					if (message.mentions.roles.size <= 0 && args[2] !== 'off') {
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Error:** A role must be mentioned`);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					}
					if (args[2] === 'off') {
						const update = db.prepare('UPDATE muterole SET role = (@role) WHERE guildid = (@guildid)');
						update.run({
							guildid: `${message.guild.id}`,
							role: null
						});
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Success:** Custom Mute Role disabled!`);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					}

					if (!status) {
						const update = db.prepare('INSERT INTO muterole (role, guildid) VALUES (@role, @guildid);');
						update.run({
							guildid: `${message.guild.id}`,
							role: `${muteRole.id}`
						});
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Success:** Mute Role updated to ${muteRole}`);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					}

					const update = db.prepare('UPDATE muterole SET role = (@role) WHERE guildid = (@guildid);');
					update.run({
						guildid: `${message.guild.id}`,
						role: `${muteRole.id}`
					});
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Success:** Mute Role updated to ${muteRole}`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}
			}
		}

		// invite manger

		if (args[0] === 'invmanager') {
			if (!message.member.guild.me.permissions.has(Permissions.FLAGS.MANAGE_GUILD)) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Config**`,
						`**◎ Error:** I need the permission \`Manage Guild\` for this command!`);
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
			this.client.getTable = db.prepare('SELECT * FROM invmanager WHERE guildid = ?');

			const lchan = message.mentions.channels.first();

			let status;
			if (message.guild.id) {
				status = this.client.getTable.get(message.guild.id);

				if (args[1] === undefined) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Error:** Please mention a channel!`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				if (args[1] === 'off') {
					// to turn logging off
					if (!status) {
						this.client.utils.messageDelete(message, 10000);

						const embed = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Config**`,
								`**◎ Error:** Invite Manager is already disabled!`);
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					}

					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Success:** Invite Manager disabled!`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					db.prepare('DELETE FROM invmanager WHERE guildid = ?').run(message.guild.id);
					return;
				}
				if (!lchan) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Error:** Check if the entegreen channel's name is correct and then type the command again.`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}
				if (lchan.type === 'voice' || lchan.type === 'category') {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Error:** Check if the entegreen text channel's name is correct and then type the command again.`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}
				if (!status) {
					const insert = db.prepare('INSERT INTO invmanager (guildid, channel) VALUES (@guildid, @channel);');
					insert.run({
						guildid: `${message.guild.id}`,
						channel: `${lchan.id}`
					});

					message.guild.fetchInvites()
						.then(invite => this.client.invites.set(message.guild.id, invite))
						.catch(error => this.client.logger.error(error));

					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Config**`,
							`**◎ Success:** Invite Manager channel set to ${lchan}`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				const update = db.prepare('UPDATE invmanager SET channel = (@channel) WHERE guildid = (@guildid);'
				);
				update.run({
					guildid: `${message.guild.id}`,
					channel: `${lchan.id}`
				});

				message.guild.fetchInvites()
					.then(invite => this.client.invites.set(message.guild.id, invite))
					.catch(error => this.client.logger.error(error));

				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Config**`,
						`**◎ Success:** Invite Manager updated to ${lchan}`);
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
		}
	}

};
