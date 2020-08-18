const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

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
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);

		const { prefix } = prefixgrab;

		// config help
		if (args[0] === undefined) {
			const embed = new MessageEmbed()
				.setThumbnail(this.client.user.displayAvatarURL())
				.setColor(message.guild.me.displayHexColor || '36393F')
				.setAuthor('Ragnarok - Config')
				.setDescription([
					`**◎ Advert Protection:**`,
					`\u3000 \`${prefix}config adsprot <on/off>\` : Toggles advert protection`,
					`\u3000`,
					`**◎ Autorole:**`,
					`\u3000 \`${prefix}config autorole <@role>\` : Sets the role users are given when they join the guild`,
					`\u3000`,
					`**◎ Logging:**`,
					`\u3000 \`${prefix}config logging <#channel/off>\` : Sets/disables the logging channel`,
					`\u3000`,
					`**◎ Prefix:**`,
					`\u3000 \`${prefix}config prefix <prefix>\` : Sets the guild prefix`,
					`\u3000`,
					`**◎ Tickets:**`,
					`\u3000 \`${prefix}config ticket cat <cat name>\` : Sets the ticket category`,
					`\u3000 \`${prefix}config ticket log <#channel>\` : Enables ticket logging`,
					`\u3000 \`${prefix}config ticket role <@role>\` : Sets custom support role for ticket system`,
					`\u3000`,
					`**◎ Welcome:**`,
					`\u3000 \`${prefix}config welcome channel <#channel>\` : Sets the welcome channel`,
					`\u3000 \`${prefix}config welcome channel off\` : Disables the welcome message`,
					`\u3000`,
					`**◎ Rolemenu:**`,
					`\u3000 \`${prefix}config rolemenu add <@role>\` : Sets the rolemenu roles`,
					`\u3000 \`${prefix}config rolemenu remove <@role>\` : Removes a role from rolemenu`,
					`\u3000 \`${prefix}config rolemenu clear\` : Removes all roles from rolemenu`,
					`\u3000`,
					`**◎ Music:**`,
					`\u3000 \`${prefix}config music role <@role>\` : Sets the DJ role`,
					`\u3000 \`${prefix}config music role off\` : Disables the DJ role`,
					`\u3000`,
					`**◎ Membercount:**`,
					`\u3000 \`${prefix}config membercount <on/off>\` : Toggles the member count module`,
					`\u3000`,
					`**◎ Dad Bot:**`,
					`\u3000 \`${prefix}config dadbot <on/off>\` : Toggles the Dad bot module`,
					`\u3000`
				])
				.setTimestamp();
			message.channel.send(embed);
			return;
		}

		// Membercount Command
		if (args[0] === 'membercount') {
			// perms checking
			if (!message.member.hasPermission('MANAGE_GUILD') && !this.client.owners.includes(message.author.id)) {
				const embed = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Invalid Perms**',
						`**◎ Error:** You do not have permission to run this command.`);
				message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
				return;
			}

			// preparing count
			this.client.getTable = db.prepare('SELECT * FROM membercount WHERE guildid = ?');
			let status;
			if (message.guild.id) {
				status = this.client.getTable.get(message.guild.id);

				if (args[1] === 'on') {
					// if already on
					if (status) {
						const embed = new MessageEmbed()
							.setColor(message.guild.me.displayHexColor || '36393F')
							.addField('**Already Enableds**',
								`**◎ Error:** Member count module is already enabled on this guild! To disable it, please use \`${prefix}config membercount <off>\``);
						message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
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

					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Success**',
							`**◎ Success:** Member count was enabled`);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));

					// if args = off
				} else if (args[1] === 'off') {
					// if already off
					if (!status) {
						const embed = new MessageEmbed()
							.setColor(message.guild.me.displayHexColor || '36393F')
							.addField('**Already Disabled**',
								`**◎ Error:** Member protection is not enabled on this guild! To activate it, please use \`${prefix}config membercount <on>\``);
						message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
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
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Success**',
							`**◎ Success:** Member count was turned off!`);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
					return;
				} else if (args[1] !== 'off' || args[1] !== 'on') {
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Incorret Usage**',
							`**◎ Error:** Correct usage: \`${prefix}config membercount <on/off>\``);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
					return;
				}
			}
		}

		// Rolemenu Command
		if (args[0] === 'rolemenu') {
			// Rolemenu Config
			if (!message.member.hasPermission('MANAGE_GUILD') && !this.client.owners.includes(message.author.id)) {
				const embed = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Invalid Perms**',
						`**◎ Error:** Only users with the \`MANAGE_GUILD\` permission can use this command!`);
				message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
				return;
			}

			if (args[1] === 'add') {
				const roleList = [];
				if (message.mentions.roles.size <= 0) {
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Incorrect Usage**',
							`**◎ Error:** You must mention a role to remove from the menu.`);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
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
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Success**',
							`**◎ Success:** Roles successfully set in the assignable role menu!`);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
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
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Success**',
							`**◎ Success:** Roles successfully set in the assignable role menu!`);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
				}
				return;
			}
			if (args[1] === 'remove') {
				if (message.mentions.roles.size <= 0) {
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Incorrect Usage**',
							`**◎ Error:** You must mention a role to remove from the menu.`);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
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

				const embed = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Success**',
						`**◎ Success:** Specified roles have successfully been cleared from the rolemenu!`);
				message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
				return;
			}
			if (args[1] === 'clear') {
				db.prepare(`DELETE FROM rolemenu where guildid=${message.guild.id}`).run();
				const embed = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Success**',
						`**◎ Success:** All roles have successfully been cleared from the rolemenu!`);
				message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
				return;
			}

			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**Incorrect Usage**',
					`**◎ Error:** Please use \`${prefix}config\` to see available commands!`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		// dadbot
		if (args[0] === 'dadbot') {
			// perms checking
			if (!message.member.hasPermission('MANAGE_GUILD') && !this.client.owners.includes(message.author.id)) {
				const embed = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Invalid Perms**',
						`**◎ Error:** Only guild managers can use this command!`);
				message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
				return;
			}

			// preparing count
			this.client.getTable = db.prepare('SELECT * FROM dadbot WHERE guildid = ?');
			let status;
			if (message.guild.id) {
				status = this.client.getTable.get(message.guild.id);

				if (args[1] === 'on') {
					// if already on
					if (status) {
						const embed = new MessageEmbed()
							.setColor(message.guild.me.displayHexColor || '36393F')
							.addField('**Already Enabled**',
								`**◎ Error:** Dad bot is already enabled on this guild! To disable it, please use \`${prefix}config dadbot <off>\``);
						message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
						return;
					}
					const insert = db.prepare('INSERT INTO dadbot (guildid, status) VALUES (@guildid, @status);');
					insert.run({
						guildid: `${message.guild.id}`,
						status: 'on'
					});
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Success**',
							`**◎ Success:** Dad bot was enabled`);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));

					// if args = off
				} else if (args[1] === 'off') {
					// if already off
					if (!status) {
						const embed = new MessageEmbed()
							.setColor(message.guild.me.displayHexColor || '36393F')
							.addField('**Already Off**',
								`**◎ Error:** Dad bot is not enabled on this guild! To activate it, please use \`${prefix}config dadbot <on>\``);
						message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
						return;
					}

					db.prepare('DELETE FROM dadbot WHERE guildid = ?').run(message.guild.id);
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Success**',
							`**◎ Success:** Dad bot was disabled!`);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
					return;
				} else if (args[1] !== 'off' || args[1] !== 'on') {
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Incorrect Usage**',
							`**◎ Error:** Correct usage \`${prefix}config dadbot <on/off>\``);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
					return;
				}
			}
		}

		// adsprot
		if (args[0] === 'adsprot') {
			// perms checking
			if (!message.member.hasPermission('MANAGE_GUILD') && !this.client.owners.includes(message.author.id)) {
				const embed = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Invalid Perms**',
						`**◎ Error:** Only guild managers can use this command!`);
				message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
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
						const embed = new MessageEmbed()
							.setColor(message.guild.me.displayHexColor || '36393F')
							.addField('**Already Enabled**',
								`**◎ Error:** Advert protection is already enabled on this guild! To disable it, please use \`${prefix}config adsprot <off>\``);
						message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
						return;
					}

					const insert = db.prepare('INSERT INTO adsprot (guildid, status) VALUES (@guildid, @status);');
					insert.run({
						guildid: `${message.guild.id}`,
						status: 'on'
					});
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Success**',
							`**◎ Success:** Advert protection was enabled`);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));

					// if args = off
				} else if (args[1] === 'off') {
					// if already off
					if (!status) {
						const embed = new MessageEmbed()
							.setColor(message.guild.me.displayHexColor || '36393F')
							.addField('**Already Disabled**',
								`**◎ Error:** Advert protection is not enabled on this guild! To activate it, please use \${prefix}config adsprot <on>\``);
						message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
						return;
					}

					db.prepare('DELETE FROM adsprot WHERE guildid = ?').run(message.guild.id);
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Success**',
							`**◎ Success:** Advert protection was enabled`);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
					return;
				} else if (args[1] !== 'off' || args[1] !== 'on') {
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Incorrect Usage**',
							`**◎ Error:** Please use \`${prefix}config adsprot <on/off>\``);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
					return;
				}
			}
		}

		// autorole
		if (args[0] === 'autorole') {
			if (!message.member.hasPermission('MANAGE_GUILD') && !this.client.owners.includes(message.author.id)) {
				const embed = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Invalid Perms**',
						`**◎ Error:** Only users with the \`MANAGE_GUILD\` permission can use this command!`);
				message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
				return;
			}

			this.client.getTable = db.prepare('SELECT * FROM autorole WHERE guildid = ?');
			let role;
			if (message.guild.id) {
				role = this.client.getTable.get(message.guild.id);

				if (!args[1]) {
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Invalid Perms**',
							`**◎ Error:** Please use \`${prefix}config autorole <role>\` __the role is case sensitive!__`);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
					return;
				}
				if (args[1] === 'off') {
					db.prepare('DELETE FROM autorole WHERE guildid = ?').run(message.guild.id);
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Success**',
							`**◎ Success:** Autorole disabled!`);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
					return;
				}
				if (!message.guild.roles.cache.some((r) => [`${args[1]}`].includes(r.name))) {
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Incorrect Usage**',
							`**◎ Error:** That role does not exist! Roles are case sensitive. (You do not tag the role, simply write the name of the role)`);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
					return;
				}
				if (role) {
					const update = db.prepare('UPDATE autorole SET role = (@role) WHERE guildid = (@guildid);');
					update.run({
						guildid: `${message.guild.id}`,
						role: `${args[1]}`
					});
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Success**',
							`**◎ Success:** Autorole updated to \`${args[1]}\`!`);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
					return;
				}

				const insert = db.prepare('INSERT INTO autorole (guildid, role) VALUES (@guildid, @role);');
				insert.run({
					guildid: `${message.guild.id}`,
					role: `${args[1]}`
				});
				const embed = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Success**',
						`**◎ Success:** Autorole set to \`${args[1]}\`!`);
				message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
				return;
			}
		}

		// logging

		if (args[0] === 'logging') {
			if (!message.member.guild.me.hasPermission('VIEW_AUDIT_LOG')) {
				const embed = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Invalid Perms**',
						`**◎ Error:** I need the permission \`View Audit Log\` for this command!`);
				message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
				return;
			}
			if (!message.member.hasPermission('MANAGE_GUILD') && !this.client.owners.includes(message.author.id)) {
				const embed = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Invalid Perms**',
						`**◎ Error:** Only users with \`MANAGE_GUILD\` can use this command!`);
				message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
				return;
			}

			this.client.getTable = db.prepare('SELECT * FROM logging WHERE guildid = ?');

			const lchan = message.mentions.channels.first();

			let status;
			if (message.guild.id) {
				status = this.client.getTable.get(message.guild.id);

				if (args[1] === undefined) {
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Incorrect Usage**',
							`**◎ Error:** Please mention a channel!`);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
					return;
				}

				if (args[1] === 'off') {
					// to turn logging off
					if (!status) {
						const embed = new MessageEmbed()
							.setColor(message.guild.me.displayHexColor || '36393F')
							.addField('**Already Disabled**',
								`**◎ Error:** Logging is already disabled!`);
						message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
						return;
					}

					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Success**',
							`**◎ Success:** Logging disabled!`);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
					db.prepare('DELETE FROM logging WHERE guildid = ?').run(message.guild.id);
					return;
				}
				if (!lchan) {
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Invalid Channel**',
							`**◎ Error:** Check if the entered channel's name is correct and then type the command again.`);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
					return;
				}
				if (lchan.type === 'voice' || lchan.type === 'category') {
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Invalid Channel**',
							`**◎ Error:** Check if the entered text channel's name is correct and then type the command again.`);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
					return;
				}
				if (!status) {
					const insert = db.prepare('INSERT INTO logging (guildid, channel) VALUES (@guildid, @channel);');
					insert.run({
						guildid: `${message.guild.id}`,
						channel: `${lchan.id}`
					});
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Success**',
							`**◎ Success:** Logging set to ${lchan}`);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
					return;
				}

				const update = db.prepare('UPDATE logging SET channel = (@channel) WHERE guildid = (@guildid);'
				);
				update.run({
					guildid: `${message.guild.id}`,
					channel: `${lchan.id}`
				});
				const embed = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Success**',
						`**◎ Success:** Logging updated to ${lchan}`);
				message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
				return;
			}
		}

		// ticket cat and log and role
		if (args[0] === 'ticket') {
			if (args[1] === 'cat') {
				if (!message.member.hasPermission('MANAGE_GUILD') && !this.client.owners.includes(message.author.id)) {
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Invalid Perms**',
							`**◎ Error:** Only users with \`MANAGE_GUILD\` can use this command!`);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
					return;
				}

				this.client.getTable = db.prepare('SELECT category FROM ticketConfig WHERE guildid = ?');

				const category = message.guild.channels.cache.find(
					(c) => c.name === args.slice(2).join(' ') && c.type === 'category'
				);

				let status;
				if (message.guild.id) {
					status = this.client.getTable.get(message.guild.id);

					if (args[2] === undefined) {
						const embed = new MessageEmbed()
							.setColor(message.guild.me.displayHexColor || '36393F')
							.addField('**Invalid Category**',
								`**◎ Error:** Please type the name of the category!`);
						message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
						return;
					}

					if (args[2] === 'off') {
						// to turn logging off
						if (!status) {
							const embed = new MessageEmbed()
								.setColor(message.guild.me.displayHexColor || '36393F')
								.addField('**Already Disabled**',
									`**◎ Error:** Ticket Category is already disabled!`);
							message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
							return;
						}

						const embed = new MessageEmbed()
							.setColor(message.guild.me.displayHexColor || '36393F')
							.addField('**Already Disabled**',
								`**◎ Error:** Ticket Category disabled!`);
						message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
						db.prepare('UPDATE ticketConfig SET category = (@cat) WHERE guildid = (@guildid);').run({
							guildid: `${message.guild.id}`,
							cat: null
						});
						return;
					}
					if (!category) {
						const embed = new MessageEmbed()
							.setColor(message.guild.me.displayHexColor || '36393F')
							.addField('**Invalid Category**',
								`**◎ Error:** Check if the entered categories name is correct and then type the command again. (The name is case sensitive!`);
						message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
						return;
					}
					if (!status) {
						const insert = db.prepare('INSERT INTO ticketConfig (guildid, category) VALUES (@guildid, @category);');
						insert.run({
							guildid: `${message.guild.id}`,
							category: `${category.id}`
						});
						const embed = new MessageEmbed()
							.setColor(message.guild.me.displayHexColor || '36393F')
							.addField('**Invalid Category**',
								`**◎ Error:** Ticket Category set to \`${category.name}\``);
						message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
						return;
					}

					const update = db.prepare('UPDATE ticketConfig SET category = (@category) WHERE guildid = (@guildid);');
					update.run({
						guildid: `${message.guild.id}`,
						category: `${category.id}`
					});
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Success**',
							`**◎ Success:** Ticket Category updated to \`${category.name}\``);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
					return;
				}
			} else if (args[1] === 'log') {
				if (!message.member.hasPermission('MANAGE_GUILD') && !this.client.owners.includes(message.author.id)) {
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Invalid Perms**',
							`**◎ Error:** Only users with \`MANAGE_GUILD\` can use this command!`);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
					return;
				}

				this.client.getTable = db.prepare('SELECT log FROM ticketConfig WHERE guildid = ?');

				const lchan = message.mentions.channels.first();

				let status;
				if (message.guild.id) {
					status = this.client.getTable.get(message.guild.id);

					if (args[2] === undefined) {
						const embed = new MessageEmbed()
							.setColor(message.guild.me.displayHexColor || '36393F')
							.addField('**Incorrect Usage**',
								`**◎ Error:** Please mention a channel!`);
						message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
						return;
					}

					if (args[2] === 'off') {
						// to turn logging off
						if (!status) {
							const embed = new MessageEmbed()
								.setColor(message.guild.me.displayHexColor || '36393F')
								.addField('**Already Disabled**',
									`**◎ Error:** Ticket Logging is already disabled!`);
							message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
							return;
						}

						const embed = new MessageEmbed()
							.setColor(message.guild.me.displayHexColor || '36393F')
							.addField('**Success**',
								`**◎ Success:** Ticket Logging disabled!`);
						message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
						db.prepare('UPDATE ticketConfig SET log = (@log) WHERE guildid = (@guildid)').run({
							guildid: message.guild.id,
							log: null
						});
						return;
					}
					if (!lchan) {
						const embed = new MessageEmbed()
							.setColor(message.guild.me.displayHexColor || '36393F')
							.addField('**Invalid Channel**',
								`**◎ Error:** Check if the entered categories name is correct and then type the command again. (The name is case sensitive!`);
						message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
						return;
					}
					if (!status) {
						const insert = db.prepare('INSERT INTO ticketConfig (guildid, log) VALUES (@guildid, @channel);');
						insert.run({
							guildid: `${message.guild.id}`,
							channel: `${lchan.id}`
						});
						const embed = new MessageEmbed()
							.setColor(message.guild.me.displayHexColor || '36393F')
							.addField('**Success**',
								`**◎ Success:** Ticket Logging set to ${lchan}`);
						message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
						return;
					}

					const update = db.prepare('UPDATE ticketConfig SET log = (@log) WHERE guildid = (@guildid);');
					update.run({
						guildid: `${message.guild.id}`,
						log: `${lchan.id}`
					});
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Success**',
							`**◎ Success:** Ticket Logging updated to ${lchan}`);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
					return;
				}
			} else if (args[1] === 'role') {
				if (!message.member.hasPermission('MANAGE_GUILD') && !this.client.owners.includes(message.author.id)) {
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Invalid Perms**',
							`**◎ Success:** Only users with \`MANAGE_GUILD\` can use this command!`);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
					return;
				}

				this.client.getTable = db.prepare('SELECT role FROM ticketConfig WHERE guildid = ?');
				const status = this.client.getTable.get(message.guild.id);

				const suppRole = message.mentions.roles.first();

				if (message.mentions.roles.size <= 0 && args[2] !== 'off') {
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Incorrect Usage**',
							`**◎ Error:** A role must be mentioned`);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
					return;
				}
				if (args[2] === 'off') {
					const update = db.prepare('UPDATE ticketConfig SET role = (@role) WHERE guildid = (@guildid)');
					update.run({
						guildid: `${message.guild.id}`,
						role: null
					});
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Success**',
							`**◎ Success:** Custom Support Role disabled!`);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
					return;
				}
				if (!status) {
					const update = db.prepare('INSERT INTO ticketConfig (role, guildid) VALUES (@role, @guildid);');
					update.run({
						guildid: `${message.guild.id}`,
						role: `${suppRole.id}`
					});
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Success**',
							`**◎ Success:** Support Role updated to ${suppRole}`);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
					return;
				}

				const update = db.prepare('UPDATE ticketConfig SET role = (@role) WHERE guildid = (@guildid);');
				update.run({
					guildid: `${message.guild.id}`,
					role: `${suppRole.id}`
				});
				const embed = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Success**',
						`**◎ Success:** Support Role updated to ${suppRole}`);
				message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
				return;
			}
		}

		// setprefix

		if (args[0] === 'prefix') {
			const talkedRecently = new Set();

			if (talkedRecently.has(message.author.id)) {
				const embed = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Please Wait**',
						`**◎ Error:** Wait 1 minute before changing the prefix again.`);
				message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			} else {
				talkedRecently.add(message.author.id);
				setTimeout(() => {
					talkedRecently.delete(message.author.id);
				}, 60000);
			}

			if (!message.member.hasPermission('MANAGE_GUILD') && !this.client.owners.includes(message.author.id)) {
				const embed = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Invalid Perms**',
						`**◎ Error:** You need to have the \`MANAGE_GUILD\` permission to use this command.`);
				message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
				return;
			}

			this.client.getTable = db.prepare('SELECT * FROM setprefix WHERE guildid = ?');

			if (args[1] === 'off') {
				const off = db.prepare('UPDATE setprefix SET prefix = (\'-\') WHERE guildid = (@guildid);');
				off.run({
					guildid: `${message.guild.id}`
				});
				const embed = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Success**',
						`**◎ Success:** Custom prefix disabled!`);
				message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
				return;
			}
			if (args[1] === '[' || args[1] === '{' || args[1] === ']' || args[1] === '}' || args[1] === ':') {
				const embed = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Blacklisted Prefix**',
						`**◎ Error:** Please choose another prefix.`);
				message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
				return;
			}

			if (!args[1]) {
				const embed = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Error**',
						`**◎ Error:** Incorrect usage!`);
				message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
				return;
			}

			if (prefix) {
				const update = db.prepare('UPDATE setprefix SET prefix = (@prefix) WHERE guildid = (@guildid);');
				update.run({
					guildid: `${message.guild.id}`,
					prefix: `${args[1]}`
				});
				const embed = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Success**',
						`**◎ Success:** Prefix updated!`);
				message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
				return;
			}

			const insert = db.prepare('INSERT INTO setprefix (guildid, prefix) VALUES (@guildid, @prefix);');
			insert.run({
				guildid: `${message.guild.id}`,
				prefix: `${args[1]}`
			});
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**Success**',
					`**◎ Success:** Prefix set!`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		// setwelcome

		if (args[0] === 'welcome') {
			if (args[1] === undefined) {
				const embed = new MessageEmbed()
					.setThumbnail(this.client.user.displayAvatarURL())
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('Ragnarok', [
						`**◎ Set Welcome:** To set the welcome channel, the command is \`${prefix}config welcome channel <#channel>\`\nTo disable the welcome, use \`${prefix}config welcome channel off\``
					])
					.setTimestamp();
				message.channel.send(embed);
				return;
			}
			if (args[1] === 'channel') {
				if (!message.member.hasPermission('MANAGE_GUILD') && !this.client.owners.includes(message.author.id)) {
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Invalid Perms**',
							`**◎ Error:** Only users with \`MANAGE_GUILD\` can use this command!`);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
					return;
				}

				this.client.getTable = db.prepare('SELECT * FROM setwelcome WHERE guildid = ?');

				const lchan = message.mentions.channels.first();

				let status;
				if (message.guild.id) {
					status = this.client.getTable.get(message.guild.id);

					if (args[2] === undefined) {
						const embed = new MessageEmbed()
							.setColor(message.guild.me.displayHexColor || '36393F')
							.addField('**Incorrect Usage**',
								`**◎ Error:** Please mention a channel!`);
						message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
						return;
					}

					if (args[2] === 'off') {
						// to turn logging off
						if (!status) {
							const embed = new MessageEmbed()
								.setColor(message.guild.me.displayHexColor || '36393F')
								.addField('**Already Disabled**',
									`**◎ Error:** Welcome channel is already disabled!`);
							message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
						} else {
							const embed = new MessageEmbed()
								.setColor(message.guild.me.displayHexColor || '36393F')
								.addField('**Success**',
									`**◎ Success:** Welcome channel disabled!`);
							message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
							db.prepare('DELETE FROM setwelcome WHERE guildid = (@guildid)').run({
								guildid: message.guild.id
							});
						}
					} else if (!lchan) {
						const embed = new MessageEmbed()
							.setColor(message.guild.me.displayHexColor || '36393F')
							.addField('**Invalid Category**',
								`**◎ Error:** Check if the entered categories name is correct and then type the command again. (The name is case sensitive!`);
						message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
					} else if (!status) {
						const insert = db.prepare('INSERT INTO setwelcome (guildid, channel) VALUES (@guildid, @channel);');
						insert.run({
							guildid: `${message.guild.id}`,
							channel: `${lchan.id}`
						});
						const embed = new MessageEmbed()
							.setColor(message.guild.me.displayHexColor || '36393F')
							.addField('**Success**',
								`**◎ Success:** Welcome channel is now set to ${lchan}`);
						message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
					} else {
						const update = db.prepare('UPDATE setwelcome SET channel = (@channel) WHERE guildid = (@guildid);');
						update.run({
							guildid: `${message.guild.id}`,
							channel: `${lchan.id}`
						});
						const embed = new MessageEmbed()
							.setColor(message.guild.me.displayHexColor || '36393F')
							.addField('**Success**',
								`**◎ Success:** Welcome channel updated to ${lchan}`);
						message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
					}
				}
			}
		}
		// Music
		if (args[0] === 'music') {
			if (args[1] === undefined) {
				const embed = new MessageEmbed()
					.setThumbnail(this.client.user.displayAvatarURL())
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('Ragnarok', [
						`**◎ Music:** To set the music role, the command is \`${prefix}config music role <@role>\`\nTo disable the role, use \`${prefix}config music role off\``
					])
					.setTimestamp();
				message.channel.send(embed);
				return;
			}
			if (args[1] === 'role') {
				if (!message.member.hasPermission('MANAGE_GUILD') && !this.client.owners.includes(message.author.id)) {
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Invalid Perms**',
							`**◎ Error:** Only users with \`MANAGE_GUILD\` can use this command!`);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
					return;
				}

				this.client.getTable = db.prepare('SELECT * FROM music WHERE guildid = ?');

				let status;
				if (message.guild.id) {
					status = this.client.getTable.get(message.guild.id);

					const djRole = message.mentions.roles.first();

					if (message.mentions.roles.size <= 0 && args[2] !== 'off') {
						const embed = new MessageEmbed()
							.setColor(message.guild.me.displayHexColor || '36393F')
							.addField('**Incorrect Usage**',
								`**◎ Error:** A role must be mentioned`);
						message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
						return;
					}
					if (args[2] === 'off') {
						const update = db.prepare('UPDATE music SET role = (@role) WHERE guildid = (@guildid)');
						update.run({
							guildid: `${message.guild.id}`,
							role: null
						});
						const embed = new MessageEmbed()
							.setColor(message.guild.me.displayHexColor || '36393F')
							.addField('**Success**',
								`**◎ Success:** Custom DJ Role disabled!`);
						message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
						return;
					}

					if (!status) {
						const update = db.prepare('INSERT INTO music (role, guildid) VALUES (@role, @guildid);');
						update.run({
							guildid: `${message.guild.id}`,
							role: `${djRole.id}`
						});
						const embed = new MessageEmbed()
							.setColor(message.guild.me.displayHexColor || '36393F')
							.addField('**Success**',
								`**◎ Success:** DJ Role updated to ${djRole}`);
						message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
						return;
					}

					const update = db.prepare('UPDATE music SET role = (@role) WHERE guildid = (@guildid);');
					update.run({
						guildid: `${message.guild.id}`,
						role: `${djRole.id}`
					});
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Success**',
							`**◎ Success:** DJ Role updated to ${djRole}`);
					message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
					return;
				}
			}
		}
	}

};
