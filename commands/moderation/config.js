/* eslint-disable no-shadow, no-unused-vars, max-nested-callbacks */
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
const { ownerID } = require('../../storage/config.json');

module.exports = {
	config: {
		name: 'config',
		usage: '${prefix}config',
		category: 'moderation',
		description: 'Displays available config commands',
		accessableby: 'Everyone',
	},
	run: async (bot, message, args) => {
		const language = require('../../storage/messages.json');

		const prefixgrab = db
			.prepare('SELECT prefix FROM setprefix WHERE guildid = ?')
			.get(message.guild.id);

		const prefix = prefixgrab.prefix;

		// config help

		if (args[0] === undefined) {
			const undeembed = new MessageEmbed()
				.setColor(0xcf40fa)
				.addField(
					'Ragnarok - Config',
					`[${prefix}config adsprot]() : Enables/Disabled advert protection\n[${prefix}config autorole]() : Sets the role users are given when they join the guild\n[${prefix}config logging]() : Sets the logging channel\n[${prefix}config prefix]() : Sets the guild prefix\n[${prefix}config ticket cat]() : Sets the ticket category\n[${prefix}config ticket log](): Enables ticket logging\n[${prefix}config ticket role](): Sets custom support role for ticket system\n[${prefix}config rolemenu add]() : Sets the role menu roles\n[${prefix}config rolemenu remove]() : Removes a role from rolemenu\n[${prefix}config rolemenu clear]() : Removes all roles from rolemenu`
				);
			message.channel.send({
				embed: undeembed,
			});
			return;
		}

		// Rolemenu Command
		if (args[0] === 'rolemenu') {
			// Rolemenu Config
			if (
				!message.member.hasPermission('MANAGE_GUILD') &&
				message.author.id !== ownerID
			) {
				const invalidpermsembed = new MessageEmbed()
					.setColor('36393F')
					.setDescription(`${language.autorole.noPermission}`);
				message.channel.send(invalidpermsembed);
				return;
			}

			if (args[1] === 'add') {
				const roleList = [];

				if (message.mentions.roles.size <= 0) {
					const errEmbed = new MessageEmbed()
						.setColor('#ff4757')
						.setDescription(
							':x: You must mention a role to remove from the menu.'
						);

					message.channel.send(errEmbed);
					return;
				}

				const foundRoleMenu = db
					.prepare(`SELECT * FROM rolemenu WHERE guildid=${message.guild.id}`)
					.get();
				if (!foundRoleMenu) {
					message.mentions.roles.forEach(role => {
						roleList.push(role.id);
					});
					const newRoleMenu = db.prepare(
						'INSERT INTO rolemenu (guildid, roleList) VALUES (@guildid, @roleList);'
					);
					newRoleMenu.run({
						guildid: `${message.guild.id}`,
						roleList: JSON.stringify(roleList),
					});
					const succEmbed = new MessageEmbed()
						.setColor('#2ed573')
						.setDescription(
							':white_check_mark: Roles successfully set in the assignable role menu!'
						);
					message.channel.send(succEmbed);
				}
				else {
					const foundRoleList = JSON.parse(foundRoleMenu.roleList);
					message.mentions.roles.forEach(role => {
						if (!foundRoleList.includes(role.id)) {
							foundRoleList.push(role.id);
						}
					});
					const updateRoleMenu = db.prepare(
						`UPDATE rolemenu SET roleList = (@roleList) WHERE guildid=${
							message.guild.id
						}`
					);
					updateRoleMenu.run({
						roleList: JSON.stringify(foundRoleList),
					});
					const succEmbed = new MessageEmbed()
						.setColor('#2ed573')
						.setDescription(
							':white_check_mark: Roles successfully set in the assignable role menu!'
						);
					message.channel.send(succEmbed);
				}
				return;
			}
			else if (args[1] === 'remove') {
				if (message.mentions.roles.size <= 0) {
					const errEmbed = new MessageEmbed()
						.setColor('#ff4757')
						.setDescription(
							':x: You must mention a role to remove from the menu.'
						);

					message.channel.send(errEmbed);
					return;
				}

				const mentions = message.mentions.roles.map(role => role.id);

				const foundRoleMenu = db
					.prepare(`SELECT * FROM rolemenu WHERE guildid = ${message.guild.id}`)
					.get();
				const roleList = JSON.parse(foundRoleMenu.roleList);

				for (const role of mentions) {
					if (roleList.includes(role)) {
						const index = roleList.indexOf(role);
						roleList.splice(index, 1);
						const updateRoleList = db.prepare(
							'UPDATE rolemenu SET roleList = (@roleList) WHERE guildid = (@guildid)'
						);
						updateRoleList.run({
							guildid: `${message.guild.id}`,
							roleList: JSON.stringify(roleList),
						});
					}
				}

				const succEmbed = new MessageEmbed()
					.setColor('#2ed573')
					.setDescription(
						':white_check_mark: Specified roles have successfully been cleared from the rolemenu!'
					);
				message.channel.send(succEmbed);
				return;
			}
			else if (args[1] === 'clear') {
				db.prepare(
					`DELETE FROM rolemenu where guildid=${message.guild.id}`
				).run();
				const succEmbed = new MessageEmbed()
					.setColor('#2ed573')
					.setDescription(
						':white_check_mark: All roles have successfully been cleared from the rolemenu!'
					);
				message.channel.send(succEmbed);
				return;
			}
			else {
				const incorrectUsageMessage = language.tickets.incorrectUsage;
				const incorrectUsage = incorrectUsageMessage.replace(
					'${prefix}',
					prefix
				);
				const incorrectUsageembed = new MessageEmbed()
					.setColor('36393F')
					.setDescription(`${incorrectUsage}`);
				message.channel.send(incorrectUsageembed);
				return;
			}
		}

		// adsprot
		if (args[0] === 'adsprot') {
			// perms checking

			if (
				!message.member.hasPermission('MANAGE_GUILD') &&
				message.author.id !== ownerID
			) {
				const invalidpermsembed = new MessageEmbed()
					.setColor('36393F')
					.setDescription(`${language.adsprot.noPermission}`);
				message.channel.send(invalidpermsembed);
				return;
			}

			// preparing count

			bot.getTable = db.prepare('SELECT * FROM adsprot WHERE guildid = ?');
			let status;
			if (message.guild.id) {
				status = bot.getTable.get(message.guild.id);

				if (args[1] === 'on') {
					// if already on
					if (status) {
						const alreadyOnMessage = language.adsprot.alreadyOn;
						const alreadyOn = alreadyOnMessage.replace('${prefix}', prefix);
						const alreadyonembed = new MessageEmbed()
							.setColor('36393F')
							.setDescription(`${alreadyOn}`);
						message.channel.send(alreadyonembed);
						return;
					}
					else {
						const insert = db.prepare(
							'INSERT INTO adsprot (guildid, status) VALUES (@guildid, @status);'
						);
						insert.run({
							guildid: `${message.guild.id}`,
							status: 'on',
						});
						const turnonembed = new MessageEmbed()
							.setColor('36393F')
							.setDescription(`${language.adsprot.turnedOn}`);
						message.channel.send(turnonembed);
					}

					// if args = off
				}
				else if (args[1] === 'off') {
					// if already off
					if (!status) {
						const alreadyOffMessage = language.adsprot.alreadyOff;
						const alreadyOff = alreadyOffMessage.replace('${prefix}', prefix);
						const alreadyoffembed = new MessageEmbed()
							.setColor('36393F')
							.setDescription(`${alreadyOff}`);
						message.channel.send(alreadyoffembed);
						return;
					}
					else {
						db.prepare('DELETE FROM adsprot WHERE guildid = ?').run(
							message.guild.id
						);
						const turnedoffembed = new MessageEmbed()
							.setColor('36393F')
							.setDescription(`${language.adsprot.turnedOff}`);
						message.channel.send(turnedoffembed);
						return;
					}
				}
				else if (args[1] !== 'off' || args[1] !== 'on') {
					const incorrectUsageMessage = language.adsprot.incorrectUsage;
					const incorrectUsage = incorrectUsageMessage.replace(
						'${prefix}',
						prefix
					);
					const incorrectembed = new MessageEmbed()
						.setColor('36393F')
						.setDescription(`${incorrectUsage}`);
					message.channel.send(incorrectembed);
					return;
				}
			}
		}

		// autorole
		if (args[0] === 'autorole') {
			if (
				!message.member.hasPermission('MANAGE_GUILD') &&
				message.author.id !== ownerID
			) {
				const invalidpermsembed = new MessageEmbed()
					.setColor('36393F')
					.setDescription(`${language.autorole.noPermission}`);
				message.channel.send(invalidpermsembed);
				return;
			}

			bot.getTable = db.prepare('SELECT * FROM autorole WHERE guildid = ?');
			let role;
			if (message.guild.id) {
				role = bot.getTable.get(message.guild.id);

				if (!args[1]) {
					const incorrectUsageMessage = language.autorole.incorrectUsage;
					const incorrectUsage = incorrectUsageMessage.replace(
						'${prefix}',
						prefix
					);
					const incorrectUsageembed = new MessageEmbed()
						.setColor('36393F')
						.setDescription(`${incorrectUsage}`);
					message.channel.send(incorrectUsageembed);
					return;
				}
				else if (args[1] === 'off') {
					db.prepare('DELETE FROM autorole WHERE guildid = ?').run(
						message.guild.id
					);
					const turnoffembed = new MessageEmbed()
						.setColor('36393F')
						.setDescription(`${language.autorole.turnedOff}`);
					message.channel.send(turnoffembed);
					return;
				}
				if (!message.guild.roles.some(r => [`${args[1]}`].includes(r.name))) {
					return message.channel.send(
						':x: **That role does not exist! Roles are case sensitive.**'
					);
				}
				if (role) {
					const update = db.prepare(
						'UPDATE autorole SET role = (@role) WHERE guildid = (@guildid);'
					);
					update.run({
						guildid: `${message.guild.id}`,
						role: `${args[1]}`,
					});
					const autoroleUpdateMessage = language.autorole.updateRole;
					const roleupdate = autoroleUpdateMessage.replace(
						'${autorole}',
						args[1]
					);
					const updatedembed = new MessageEmbed()
						.setColor('36393F')
						.setDescription(`${roleupdate}`);
					message.channel.send(updatedembed);
					return;
				}
				else {
					const insert = db.prepare(
						'INSERT INTO autorole (guildid, role) VALUES (@guildid, @role);'
					);
					insert.run({
						guildid: `${message.guild.id}`,
						role: `${args[1]}`,
					});
					const autoroleSetMessage = language.autorole.roleSet;
					const roleSet = autoroleSetMessage.replace('${autorole}', args[1]);
					const setembed = new MessageEmbed()
						.setColor('36393F')
						.setDescription(`${roleSet}`);
					message.channel.send(setembed);
					return;
				}
			}
		}

		// logging

		if (args[0] === 'logging') {
			if (
				!message.member.hasPermission('MANAGE_GUILD') &&
				message.author.id !== ownerID
			) {
				return message.channel.send(`${language.logging.noPermission}`);
			}

			bot.getTable = db.prepare('SELECT * FROM logging WHERE guildid = ?');

			const lchan = message.mentions.channels.first();

			let status;
			if (message.guild.id) {
				status = bot.getTable.get(message.guild.id);

				if (args[1] === undefined) {
					message.channel.send(':x: | **Please mention a channel!**');
					return;
				}

				if (args[1] === 'off') {
					// to turn logging off
					if (!status) {
						message.channel.send(':x: | **Logging is already disabled!**');
						return;
					}
					else {
						message.channel.send(':white_check_mark: | **Logging disabled!**');
						db.prepare('DELETE FROM logging WHERE guildid = ?').run(
							message.guild.id
						);
						return;
					}
				}
				else if (!lchan) {
					message.channel.send(`${language.logging.invalidChannel}`);
					return;
				}
				else if (lchan.type === 'voice' || lchan.type === 'category') {
					message.channel.send(`${language.logging.invalidTextChannel}`);
					return;
				}
				else if (!status) {
					const insert = db.prepare(
						'INSERT INTO logging (guildid, channel) VALUES (@guildid, @channel);'
					);
					insert.run({
						guildid: `${message.guild.id}`,
						channel: `${lchan.id}`,
					});
					message.channel.send(
						`:white_check_mark: | **Logging set to ${lchan}**`
					);
					return;
				}
				else {
					const update = db.prepare(
						'UPDATE logging SET channel = (@channel) WHERE guildid = (@guildid);'
					);
					update.run({
						guildid: `${message.guild.id}`,
						channel: `${lchan.id}`,
					});
					message.channel.send(
						`:white_check_mark: | ** Logging updated to ${lchan}**`
					);
					return;
				}
			}
		}

		// ticket cat and log and role

		if (args[0] === 'ticket') {
			if (args[1] === 'cat') {
				if (
					!message.member.hasPermission('MANAGE_GUILD') &&
					message.author.id !== ownerID
				) {
					return message.channel.send(`${language.tickets.noPermission}`);
				}

				bot.getTable = db.prepare(
					'SELECT category FROM ticketConfig WHERE guildid = ?'
				);

				const category = message.guild.channels.find(
					c => c.name == args.slice(2).join(' ') && c.type == 'category'
				);

				let status;
				if (message.guild.id) {
					status = bot.getTable.get(message.guild.id);

					if (args[2] === undefined) {
						message.channel.send(
							':x: | **Please type the name of the category!**'
						);
						return;
					}

					if (args[2] === 'off') {
						// to turn logging off
						if (!status) {
							message.channel.send(
								':x: | **Ticket Category is already disabled!**'
							);
							return;
						}
						else {
							message.channel.send(
								':white_check_mark: | **Ticket Category disabled!**'
							);
							db.prepare(
								'DELETE category FROM ticketConfig WHERE guildid = ?'
							).run(message.guild.id);
							return;
						}
					}
					else if (!category) {
						message.channel.send(`${language.tickets.invalidCategory}`);
						return;
					}
					else if (!status) {
						const insert = db.prepare(
							'INSERT INTO ticketConfig (guildid, category) VALUES (@guildid, @category);'
						);
						insert.run({
							guildid: `${message.guild.id}`,
							category: `${category.id}`,
						});
						message.channel.send(
							`:white_check_mark: | **Ticket Category set to \`${
								category.name
							}\`**`
						);
						return;
					}
					else {
						const update = db.prepare(
							'UPDATE ticketConfig SET category = (@category) WHERE guildid = (@guildid);'
						);
						update.run({
							guildid: `${message.guild.id}`,
							category: `${category.id}`,
						});
						message.channel.send(
							`:white_check_mark: | ** Ticket Category updated to \`${
								category.name
							}\`**`
						);
						return;
					}
				}
			}
			else if (args[1] === 'log') {
				if (
					!message.member.hasPermission('MANAGE_GUILD') &&
					message.author.id !== ownerID
				) {
					return message.channel.send(`${language.tickets.noPermission}`);
				}

				bot.getTable = db.prepare(
					'SELECT log FROM ticketConfig WHERE guildid = ?'
				);

				const lchan = message.mentions.channels.first();

				let status;
				if (message.guild.id) {
					status = bot.getTable.get(message.guild.id);

					if (args[2] === undefined) {
						message.channel.send(':x: | **Please mention a channel!**');
						return;
					}

					if (args[2] === 'off') {
						// to turn logging off
						if (!status) {
							message.channel.send(
								':x: | **Ticket Logging is already disabled!**'
							);
							return;
						}
						else {
							message.channel.send(
								':white_check_mark: | **Ticket Logging disabled!**'
							);
							db.prepare(
								'UPDATE ticketConfig SET log = (@log) WHERE guildid = (@guildid)'
							).run({
								guildid: message.guild.id,
								log: null,
							});
							return;
						}
					}
					else if (!lchan) {
						message.channel.send(`${language.tickets.invalidCategory}`);
						return;
					}
					else if (!status) {
						const insert = db.prepare(
							'INSERT INTO ticketConfig (guildid, log) VALUES (@guildid, @channel);'
						);
						insert.run({
							guildid: `${message.guild.id}`,
							channel: `${lchan.id}`,
						});
						message.channel.send(
							`:white_check_mark: | **Ticket Logging set to ${lchan}**`
						);
						return;
					}
					else {
						const update = db.prepare(
							'UPDATE ticketConfig SET log = (@log) WHERE guildid = (@guildid);'
						);
						update.run({
							guildid: `${message.guild.id}`,
							log: `${lchan.id}`,
						});
						message.channel.send(
							`:white_check_mark: | ** Ticket Logging updated to ${lchan}**`
						);
						return;
					}
				}
			}
			else if (args[1] === 'role') {
				if (
					!message.member.hasPermission('MANAGE_GUILD') &&
					message.author.id !== ownerID
				) {
					return message.channel.send(`${language.tickets.noPermission}`);
				}

				bot.getTable = db.prepare(
					'SELECT role FROM ticketConfig WHERE guildid = ?'
				);
				const status = bot.getTable.get(message.guild.id);

				const suppRole = message.mentions.roles.first();

				if (message.mentions.roles.size <= 0 && args[2] !== 'off') {
					return message.channel.send(':x: | A role must be mentioned');
				}
				else if (args[2] === 'off') {
					const update = db.prepare(
						'UPDATE ticketConfig SET role = (@role) WHERE guildid = (@guildid)'
					);
					update.run({
						guildid: `${message.guild.id}`,
						role: null,
					});
					message.channel.send(
						':white_check_mark: | **Custom Support Role disabled!**'
					);
					return;
				}
				else if (!status) {
					const update = db.prepare(
						'INSERT INTO ticketConfig (role, guildid) VALUES (@role, @guildid);'
					);
					update.run({
						guildid: `${message.guild.id}`,
						role: `${suppRole.id}`,
					});
					message.channel.send(
						`:white_check_mark: | **Support Role updated to ${suppRole}**`
					);
					return;
				}
				else {
					const update = db.prepare(
						'UPDATE ticketConfig SET role = (@role) WHERE guildid = (@guildid);'
					);
					update.run({
						guildid: `${message.guild.id}`,
						role: `${suppRole.id}`,
					});
					message.channel.send(
						`:white_check_mark: | **Support Role updated to ${suppRole}**`
					);
					return;
				}
			}
		}

		// setprefix

		if (args[0] === 'prefix') {
			const talkedRecently = new Set();

			if (talkedRecently.has(message.author.id)) {
				message.channel.send(
					':x: | **Wait 1 minute before changing the prefix again.**'
				);
			}
			else {
				talkedRecently.add(message.author.id);
				setTimeout(() => {
					talkedRecently.delete(message.author.id);
				}, 60000);
			}

			const language = require('../../storage/messages.json');

			if (
				!message.member.hasPermission('MANAGE_GUILD') &&
				message.author.id !== ownerID
			) {
				return message.channel.send(`${language.setprefix.noPermission}`);
			}

			bot.getTable = db.prepare('SELECT * FROM setprefix WHERE guildid = ?');
			let prefix;
			if (message.guild.id) {
				prefix = bot.getTable.get(message.guild.id);
			}

			if (args[1] === 'off') {
				const off = db.prepare(
					'UPDATE setprefix SET prefix = (\'-\') WHERE guildid = (@guildid);'
				);
				off.run({
					guildid: `${message.guild.id}`,
				});
				message.channel.send(
					':white_check_mark: | **Custom prefix disabled!**'
				);
				return;
			}
			if (
				args[1] === '[' ||
				args[1] === '{' ||
				args[1] === ']' ||
				args[1] === '}' ||
				args[1] === ':'
			) {
				message.channel.send(`${language.setprefix.blacklistedPrefix}`);
				return;
			}

			if (!args[1]) {
				return message.channel.send(`${language.setprefix.incorrectUsage}`);
			}

			if (prefix) {
				const update = db.prepare(
					'UPDATE setprefix SET prefix = (@prefix) WHERE guildid = (@guildid);'
				);
				update.run({
					guildid: `${message.guild.id}`,
					prefix: `${args[1]}`,
				});
				message.channel.send(':white_check_mark: | **Prefix updated!**');
				return;
			}
			else {
				const insert = db.prepare(
					'INSERT INTO setprefix (guildid, prefix) VALUES (@guildid, @prefix);'
				);
				insert.run({
					guildid: `${message.guild.id}`,
					prefix: `${args[1]}`,
				});
				message.channel.send(':white_check_mark: | **Prefix set!**');
				return;
			}
		}
	},
};
