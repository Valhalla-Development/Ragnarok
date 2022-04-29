/* eslint-disable consistent-return */
/* eslint-disable no-inline-comments */
/* eslint-disable no-mixed-operators */
const Event = require('../../Structures/Event');
const { MessageEmbed, Permissions, Formatters, MessageButton, MessageActionRow } = require('discord.js');
const moment = require('moment');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const coinCooldown = new Set();
const coinCooldownSeconds = 60;
const xpCooldown = new Set();
const xpCooldownSeconds = 60;
const urlRegexSafe = require('url-regex-safe');
const dadCooldown = new Set();
const dadCooldownSeconds = 60;
const fetch = require('node-fetch-cjs');
const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 7);

module.exports = class extends Event {

	async run(message) {
		const modMail = async () => {
			if (!message.guild) {
				if (message.author.bot) return;

				// Filter all guilds where the user is in
				const guilds = this.client.guilds.cache.filter(guild => guild.members.cache.get(message.author.id));

				if (!guilds) {
					const embed = new MessageEmbed()
						.setColor('#A10000')
						.addField(`**${this.client.user.username} - Mod Mail**`,
							`**◎ Error:** You need to share a server with ${this.client.user} to use Mod Mail.`);
					message.reply({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				const comCooldown = new Set();
				const comCooldownSeconds = 30;

				if (comCooldown.has(message.author.id)) {
					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Mod Mail**`,
							`**◎ Error:** Please do not spam the request.\nYou can canel your previous request by clicking the \`Cancel\` button.`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				// Then filter which guilds have tickets enabled in the db
				const guildsWithTickets = guilds.filter(guild => {
					const row = db.prepare('SELECT * FROM ticketConfig WHERE guildid = ?').get(guild.id);
					return row;
				});

				// Map guilds by: name, id
				const guildsMap = guildsWithTickets.map(guild => ({
					name: guild.name,
					id: guild.id
				}));

				// Sort guilds by: name in alphabetical order
				const sortedGuilds = guildsMap.sort((a, b) => {
					var nameA = a.name.toUpperCase();
					var nameB = b.name.toUpperCase();
					if (nameA < nameB) {
						return -1;
					}
					if (nameA > nameB) {
						return 1;
					}
					return 0;
				});

				// Set embed fields from new map to object and number them
				const embedFields = sortedGuilds.map((guild, index) => ({
					name: `${index + 1}. ${guild.name}`,
					value: `Guild ID: \`${guild.id}\``,
					inline: true
				}));

				// Map embedFields to buttons with numbers
				const buttons = embedFields.map((obj) => {
					const buttonMap = new MessageButton()
						.setStyle('SUCCESS')
						.setLabel(`${obj.name.slice(0, obj.name.indexOf('.'))}`)
						.setCustomId(`modMail-${obj.value.substring(obj.value.indexOf('`') + 1, obj.value.lastIndexOf('`'))}`);
					return buttonMap;
				});

				// Trim buttons to 24
				const trimmedButtons = buttons.slice(0, 24);

				const cancelButton = new MessageButton()
					.setStyle('DANGER')
					.setLabel(`Cancel`)
					.setCustomId(`cancelModMail`);
				trimmedButtons.push(cancelButton);

				// Split buttons into arrays of 5
				const splitButtons = [];
				for (let i = 0; i < trimmedButtons.length; i += 5) {
					splitButtons.push(trimmedButtons.slice(i, i + 5));
				}
				const finalButtonArray = splitButtons.splice(0, 5);

				// For each finalButtonArray, create a MessageActionRow()
				const actionRows = [];
				for (let i = 0; i < finalButtonArray.length; i++) {
					const actionRow = new MessageActionRow()
						.addComponents(finalButtonArray[i]);
					actionRows.push(actionRow);
				}

				const embed = new MessageEmbed()
					.setColor('#A10000')
					.setTitle('Select Server')
					.setDescription('Select which server you wish to send this message to. You can do so by clicking the corresponding button.')
					.addFields(...embedFields);

				if (!comCooldown.has(message.author.id)) {
					comCooldown.add(message.author.id);
				}
				setTimeout(() => {
					if (comCooldown.has(message.author.id)) {
						comCooldown.delete(message.author.id);
					}
				}, comCooldownSeconds * 1000);

				// Send embed
				try {
					const m = await message.reply({ components: [...actionRows], embeds: [embed] });

					const filter = (but) => but.user.id !== this.client.user.id;

					const collector = m.createMessageComponentCollector({ filter, time: 15000 });

					collector.on('collect', async b => {
						if (b.customId === 'cancelModMail') {
							this.client.utils.deletableCheck(m, 0);

							const noGuild = new MessageEmbed()
								.setColor('#A10000')
								.addField(`**${this.client.user.username} - Mod Mail**`,
									`**◎ Success:** Your request has been cancelled.`);
							message.reply({ embeds: [noGuild] }).then((d) => this.client.utils.deletableCheck(d, 10000));
							return;
						}
						if (comCooldown.has(message.author.id)) {
							comCooldown.delete(message.author.id);
						}

						const trimGuild = b.customId.substring(b.customId.indexOf('-') + 1);
						const fetchGuild = this.client.guilds.cache.get(trimGuild);

						if (!fetchGuild) {
							this.client.utils.deletableCheck(m, 0);

							const noGuild = new MessageEmbed()
								.setColor('#A10000')
								.addField(`**${this.client.user.username} - Mod Mail**`,
									`**◎ Error:** I could not find the server you selected. Please try again.`);
							message.reply({ embeds: [noGuild] }).then((d) => this.client.utils.deletableCheck(d, 10000));
							return;
						}

						if (!fetchGuild.me.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
							this.client.utils.deletableCheck(m, 0);

							const botPerm = new MessageEmbed()
								.setColor(this.client.utils.color(fetchGuild.me.displayHexColor))
								.addField(`**${this.client.user.username} - Mod Mail**`,
									`**◎ Error:** It seems \`${fetchGuild.name}\` has removed the \`MANAGE_CHANNELS\` permission from me. I cannot function properly without it :cry:\nPlease report this within \`${fetchGuild}\` to a server moderator.`);
							message.reply({ embeds: [botPerm] }).then((d) => this.client.utils.deletableCheck(d, 10000));
							return;
						}

						const suppRole = db.prepare(`SELECT role FROM ticketConfig WHERE guildid = ${fetchGuild.id}`).get();

						// "Support" role
						if (!fetchGuild.roles.cache.find((r) => r.name === 'Support Team') && !suppRole) {
							this.client.utils.deletableCheck(m, 0);

							const nomodRole = new MessageEmbed()
								.setColor(this.client.utils.color(fetchGuild.me.displayHexColor))
								.addField(`**${this.client.user.username} - Mod Mail**`,
									`**◎ Error:** \`${fetchGuild.name}\` doesn't have a \`Support Team\` role made, so the ticket can't be opened.\nPlease report this within \`${fetchGuild}\` to a server moderator.`);
							message.reply({ embeds: [nomodRole] }).then((d) => this.client.utils.deletableCheck(d, 10000));
							return;
						}

						// Make sure this is the user's only ticket.
						const foundTicket = db.prepare(`SELECT authorid FROM tickets WHERE guildid = ${fetchGuild.id} AND authorid = (@authorid)`);
						const checkTicketEx = db.prepare(`SELECT chanid FROM tickets WHERE guildid = ${fetchGuild.id} AND authorid = ${message.author.id}`).get();
						const roleCheckEx = db.prepare(`SELECT role FROM ticketConfig WHERE guildid = ${fetchGuild.id}`).get();
						if (checkTicketEx) {
							if (checkTicketEx.chanid === null) {
								db.prepare(`DELETE FROM tickets WHERE guildid = ${fetchGuild.id} AND authorid = ${message.author.id}`).run();
							}
							if (!fetchGuild.channels.cache.find((channel) => channel.id === checkTicketEx.chanid)) {
								db.prepare(`DELETE FROM tickets WHERE guildid = ${fetchGuild.id} AND authorid = ${message.author.id}`).run();
							}
						}
						if (roleCheckEx) {
							if (!fetchGuild.roles.cache.find((role) => role.id === roleCheckEx.role)) {
								const updateRole = db.prepare(`UPDATE ticketConfig SET role = (@role) WHERE guildid = ${fetchGuild.id}`);
								updateRole.run({
									role: null
								});
							}
						}
						if (foundTicket.get({ authorid: message.author.id })) {
							this.client.utils.deletableCheck(m, 0);

							const existTM = new MessageEmbed()
								.setColor(this.client.utils.color(fetchGuild.me.displayHexColor))
								.addField(`**${this.client.user.username} - Mod Mail**`,
									`**◎ Error:** You already have a ticket open in \`${fetchGuild.name}\`!`);
							message.channel.send({ embeds: [existTM] }).then((d) => this.client.utils.deletableCheck(d, 10000));
							return;
						}

						const nickName = fetchGuild.members.cache.get(message.author.id).displayName;

						// Make Ticket
						const id = db.prepare(`SELECT category FROM ticketConfig WHERE guildid = ${fetchGuild.id};`).get();
						const reason = message.content;
						const randomString = nanoid();
						if (!id) {
							const newTicket = db.prepare('INSERT INTO tickets (guildid, ticketid, authorid, reason) values (@guildid, @ticketid, @authorid, @reason);');
							newTicket.run({
								guildid: fetchGuild.id,
								ticketid: randomString,
								authorid: message.author.id,
								reason
							});
							// Create the channel with the name "ticket-" then the user's ID.
							const role = fetchGuild.roles.cache.find((x) => x.name === 'Support Team') || fetchGuild.roles.cache.find((r) => r.id === suppRole.role);
							const role2 = fetchGuild.roles.everyone;
							fetchGuild.channels.create(`ticket-${nickName}-${randomString}`, {
								permissionOverwrites: [
									{
										id: role.id,
										allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]
									},
									{
										id: role2.id,
										deny: [Permissions.FLAGS.VIEW_CHANNEL]
									},
									{
										id: message.author.id,
										allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]
									},
									{
										id: this.client.user.id,
										allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]
									}
								]
							}).then((c) => {
								const updateTicketChannel = db.prepare(`UPDATE tickets SET chanid = (@chanid) WHERE guildid = ${fetchGuild.id} AND ticketid = (@ticketid)`);
								updateTicketChannel.run({
									chanid: c.id,
									ticketid: randomString
								});

								const newTicketE = new MessageEmbed()
									.setColor(this.client.utils.color(fetchGuild.me.displayHexColor))
									.addField(`**${this.client.user.username} - New**`,
										`**◎ Success:** Your ticket has been created in \`${fetchGuild.name}\`, <#${c.id}>.`);
								message.reply({ embeds: [newTicketE] });
								const newTicketEm = new MessageEmbed()
									.setColor(this.client.utils.color(fetchGuild.me.displayHexColor))
									.setTitle('New Ticket')
									.setDescription(`Hello \`${message.author.tag}\`! Welcome to our support ticketing system. Please hold tight and our administrators will be with you shortly. You can close this ticket at any time using \`-close\`.\n\n\nYou opened this ticket for the reason:\n\`\`\`${reason}\`\`\`\n**NOTE:** If you did not provide a reason, please send your reasoning for opening this ticket now.`);
								c.send({ embeds: [newTicketEm] });
								// And display any errors in the console.
								const logget = db.prepare(`SELECT log FROM ticketConfig WHERE guildid = ${fetchGuild.id};`).get();
								if (!logget) {
									return;
								}
								const logchan = fetchGuild.channels.cache.find((chan) => chan.id === logget.log);
								if (!logchan) return;

								const openEpoch = Math.floor(new Date().getTime() / 1000);

								const logEmbed = new MessageEmbed()
									.setColor(this.client.utils.color(fetchGuild.me.displayHexColor))
									.setAuthor({ name: 'Ticket Opened', iconURL: fetchGuild.iconURL({ dynamic: true }) })
									.addFields({ name: `**Ticket ID**`, value: `[${randomString}](https://discord.com/channels/${fetchGuild.id}/${c.id})`, inline: true },
										{ name: `**Opened By**`, value: `${message.author}`, inline: true },
										{ name: `**Time Opened**`, value: `<t:${openEpoch}>`, inline: true },
										{ name: `**Reason**`, value: `${reason}`, inline: true });
								logchan.send({ embeds: [logEmbed] });
							}).catch(console.error);
						} else {
							// Check how many channels are in the category
							const category = message.guild.channels.cache.find((chan) => chan.id === id.category);
							const categoryLength = category.children.size;

							let newId;
							// Check if the category has the max amount of channels
							if (categoryLength >= 50) {
								// Clone the category
								await category.clone({ name: `${category.name}`, reason: 'max channels per category reached' }).then((chn) => {
									chn.setParent(category.parentId);
									chn.setPosition(category.rawPosition + 1);

									newId = chn.id;

									// Update the database
									const update = db.prepare('UPDATE ticketConfig SET category = (@category) WHERE guildid = (@guildid);');
									update.run({
										guildid: `${message.guild.id}`,
										category: `${chn.id}`
									});
								});
							}

							const newTicket = db.prepare('INSERT INTO tickets (guildid, ticketid, authorid, reason) values (@guildid, @ticketid, @authorid, @reason);');
							newTicket.run({
								guildid: fetchGuild.id,
								ticketid: randomString,
								authorid: message.author.id,
								reason
							});
							const ticategory = newId || id.category;

							const role = fetchGuild.roles.cache.find((x) => x.name === 'Support Team') || fetchGuild.roles.cache.find((r) => r.id === suppRole.role);
							const role2 = fetchGuild.roles.everyone;
							// Create the channel with the name "ticket-" then the user's ID.
							fetchGuild.channels.create(`ticket-${nickName}-${randomString}`, {
								parent: ticategory,
								permissionOverwrites: [
									{
										id: role.id,
										allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]
									},
									{
										id: role2.id,
										deny: [Permissions.FLAGS.VIEW_CHANNEL]
									},
									{
										id: message.author.id,
										allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]
									},
									{
										id: this.client.user.id,
										allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]
									}
								]
							}).then(async (c) => {
								const updateTicketChannel = db.prepare(`UPDATE tickets SET chanid = (@chanid) WHERE guildid = ${fetchGuild.id} AND ticketid = (@ticketid)`);
								updateTicketChannel.run({
									chanid: c.id,
									ticketid: randomString
								});
								// Send a message saying the ticket has been created.
								const newTicketE = new MessageEmbed()
									.setColor(this.client.utils.color(fetchGuild.me.displayHexColor))
									.addField(`**${this.client.user.username} - New**`,
										`**◎ Success:** Your ticket has been created in \`${fetchGuild.name}\`, <#${c.id}>.`);
								message.channel.send({ embeds: [newTicketE] });

								const buttonClose = new MessageButton()
									.setStyle('SUCCESS')
									.setLabel('🔒 Close')
									.setCustomId('closeTicket');

								const buttonCloseReason = new MessageButton()
									.setStyle('SUCCESS')
									.setLabel('🔒 Close With Reason')
									.setCustomId('closeTicketReason');

								const row = new MessageActionRow()
									.addComponents(buttonClose, buttonCloseReason);

								const embedTicket = new MessageEmbed()
									.setColor(this.client.utils.color(fetchGuild.me.displayHexColor))
									.setTitle('New Ticket')
									.setDescription(`Hello \`${message.author.tag}\`! Welcome to our support ticketing system. Please hold tight and our administrators will be with you shortly. \n\n\nYou opened this ticket for the reason:\n\`\`\`${reason}\`\`\`\n**NOTE:** If you did not provide a reason, please send your reasoning for opening this ticket now.`);
								c.send({ components: [row], embeds: [embedTicket] });
								// And display any errors in the console.
								const logget = db.prepare(`SELECT log FROM ticketConfig WHERE guildid = ${fetchGuild.id};`).get();
								if (!logget) {
									return;
								}

								const logchan = fetchGuild.channels.cache.find((chan) => chan.id === logget.log);
								if (!logchan) return;

								const openEpoch = Math.floor(new Date().getTime() / 1000);

								const logEmbed = new MessageEmbed()
									.setColor(this.client.utils.color(fetchGuild.me.displayHexColor))
									.setAuthor({ name: 'Ticket Opened', iconURL: fetchGuild.iconURL({ dynamic: true }) })
									.addFields({ name: `**Ticket ID**`, value: `[${randomString}](https://discord.com/channels/${fetchGuild.id}/${c.id})`, inline: true },
										{ name: `**Opened By**`, value: `${message.author}`, inline: true },
										{ name: `**Time Opened**`, value: `<t:${openEpoch}>`, inline: true },
										{ name: `**Reason**`, value: `${reason}`, inline: true });
								logchan.send({ embeds: [logEmbed] });
							}).catch(console.error);
						}
						this.client.utils.deletableCheck(m, 0);
					});

					collector.on('end', (_, reason) => {
						if (comCooldown.has(message.author.id)) {
							comCooldown.delete(message.author.id);
						}

						if (reason === 'time') {
							this.client.utils.deletableCheck(m, 0);
							return;
						}
					});
				} catch (e) {
					return console.log(e);
				}
			}
		};
		modMail();

		if (!message.guild || message.author.bot) return;

		// Custom prefixes
		const prefixes = db.prepare('SELECT count(*) FROM setprefix WHERE guildid = ?').get(message.guild.id);
		if (!prefixes['count(*)']) {
			const insert = db.prepare('INSERT INTO setprefix (guildid, prefix) VALUES (@guildid, @prefix);');
			insert.run({
				guildid: `${message.guild.id}`,
				prefix: '-'
			});
			return;
		}

		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const prefixcommand = prefixgrab.prefix;
		const messageArray = message.content.split(' ');
		const dadArgs = messageArray.slice(1);
		const oargresult = dadArgs.join(' ');

		// eslint-disable-next-line no-unused-vars
		const [cmd, ...args] = message.content.slice(prefixcommand.length).trim().split(/ +/g);
		const command = this.client.commands.get(cmd.toLowerCase()) || this.client.commands.get(this.client.aliases.get(cmd.toLowerCase()));

		// AFK Module
		function afkModule(client) {
			const regex = /<@![0-9]{0,18}>/g;
			const found = message.content.match(regex);
			const pingCheck = db.prepare('SELECT * FROM afk WHERE guildid = ?').get(message.guild.id);
			const afkGrab = db.prepare('SELECT * FROM afk WHERE user = ? AND guildid = ?').get(message.author.id, message.guild.id);

			if (afkGrab) {
				if (command && command.name === 'afk') return;
				const deleteTicket = db.prepare(`DELETE FROM afk WHERE guildid = ${message.guild.id} AND user = (@user)`);
				deleteTicket.run({
					user: message.author.id
				});

				const embed = new MessageEmbed()
					.setColor(client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${client.user.username} - AFK**`,
						`**◎** ${message.author} is no longer AFK.`);
				message.channel.send({ embeds: [embed] });
				return;
			}

			if (found && pingCheck) {
				const afkCheck = db.prepare('SELECT * FROM afk WHERE user = ? AND guildid = ?').get(found[0].slice(3, 21), message.guild.id);
				if (afkCheck) {
					const error = new MessageEmbed()
						.setColor(client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${client.user.username} - AFK**`,
							`**◎** Please do not ping ${found}, they are currently AFK with the reason:\n\n${afkCheck.reason}`);
					message.channel.send({ embeds: [error] }).then((m) => client.utils.deletableCheck(m, 10000));
					return;
				}
			}
		}
		afkModule(this.client);

		// Prefix command
		if (message.content.toLowerCase() === `${this.client.prefix}prefix`) {
			const prefixSet = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.setDescription(`**◎ This guild's prefix is:** \`${prefixSet.prefix}\``);
			message.channel.send({ embeds: [embed] });
			return;
		}

		// Easter Egg/s
		if (message.content.includes('(╯°□°）╯︵ ┻━┻')) {
			message.channel.send({ content: 'Leave my table alone!\n┬─┬ ノ( ゜-゜ノ)' });
		}

		// Balance (balance)
		if (message.author.bot) return;
		let balance;
		balance = this.client.getBalance.get(`${message.author.id}-${message.guild.id}`);
		if (!balance) {
			const claimNewUserTime = new Date().getTime() + this.client.ecoPrices.newUserTime;

			balance = {
				id: `${message.author.id}-${message.guild.id}`,
				user: message.author.id,
				guild: message.guild.id,
				hourly: null,
				daily: null,
				weekly: null,
				monthly: null,
				stealcool: null,
				fishcool: null,
				farmcool: null,
				boosts: null,
				items: null,
				cash: 0,
				bank: 500,
				total: 500,
				claimNewUser: claimNewUserTime,
				farmPlot: null,
				dmHarvest: null,
				harvestedCrops: null,
				lottery: null
			};
		}
		const curBal = balance.cash;
		const curBan = balance.bank;
		const coinAmt = Math.floor(Math.random() * this.client.ecoPrices.maxPerM) + this.client.ecoPrices.minPerM;
		if (coinAmt) {
			if (!coinCooldown.has(message.author.id)) {
				balance.cash = curBal + coinAmt;
				balance.total = curBal + curBan + coinAmt;
				this.client.setBalance.run(balance);
				coinCooldown.add(message.author.id);
				setTimeout(() => {
					coinCooldown.delete(message.author.id);
				}, coinCooldownSeconds * 1000);
			}
		}

		// Scores (level)
		function levelSystem(grabClient) {
		// Level disabled check
			const levelDb = db.prepare(`SELECT status FROM level WHERE guildid = ${message.guild.id};`).get();
			if (levelDb) return;
			let score;
			if (message.guild) {
				score = grabClient.getScore.get(message.author.id, message.guild.id);
				if (!score) {
					score = {
						id: `${message.guild.id}-${message.author.id}`,
						user: message.author.id,
						guild: message.guild.id,
						points: 0,
						level: 0,
						country: null,
						image: null
					};
				}
				const xpAdd = Math.floor(Math.random() * (25 - 15 + 1) + 15); // Random amount between 15 - 25
				const curxp = score.points; // Current points
				const curlvl = score.level; // Current level
				const levelNoMinus = score.level + 1;
				const nxtLvl = 5 / 6 * levelNoMinus * (2 * levelNoMinus * levelNoMinus + 27 * levelNoMinus + 91);
				score.points = curxp + xpAdd;
				if (nxtLvl <= score.points) {
					score.level = curlvl + 1;
					if (score.level === 0) return;
					if (xpCooldown.has(message.author.id)) return;
					const lvlup = new MessageEmbed()
						.setAuthor({ name: `Congratulations ${message.author.username}` })
						.setThumbnail('https://ya-webdesign.com/images250_/surprised-patrick-png-7.png')
						.setColor(grabClient.utils.color(message.guild.me.displayHexColor))
						.setDescription(`**You have leveled up!**\nNew Level: \`${curlvl + 1}\``);
					message.channel.send({ embeds: [lvlup] }).then((m) => grabClient.utils.deletableCheck(m, 10000));
				}
			}
			if (!xpCooldown.has(message.author.id)) {
				xpCooldown.add(message.author.id);
				grabClient.setScore.run(score);
				setTimeout(() => {
					xpCooldown.delete(message.author.id);
				}, xpCooldownSeconds * 1000);
			}
		}
		levelSystem(this.client);

		// Dad Bot

		function dadBot() {
			const dadbot = db.prepare(`SELECT * FROM dadbot WHERE guildid = ${message.guild.id};`).get();
			if (!dadbot) {
				return;
			}

			if (dadCooldown.has(message.author.id)) return;
			if (message.content.toLowerCase().startsWith('im ') || message.content.toLowerCase().startsWith('i\'m ')) {
				if (args.length > 10) {
					return;
				}
				if (args[0] === undefined) {
					return;
				}
				const matches = urlRegexSafe({ strict: false }).test(message.content.toLowerCase());

				if (matches) {
					message.channel.send({
						files: ['./Storage/Images/dadNo.png']
					});
				} else if (
					message.content.toLowerCase().startsWith('im dad') || message.content.toLowerCase().startsWith('i\'m dad')) {
					message.channel.send({ content: 'No, I\'m Dad!' });
				} else {
					message.channel.send({ content: `Hi ${oargresult}, I'm Dad!` });
				}
			}
			if (!dadCooldown.has(message.author.id)) {
				dadCooldown.add(message.author.id);
				setTimeout(() => {
					dadCooldown.delete(message.author.id);
				}, dadCooldownSeconds * 1000);
			}
		}
		dadBot();

		// Ads protection checks
		function adsProt(grabClient) {
			const adsprot = db.prepare('SELECT count(*) FROM adsprot WHERE guildid = ?').get(message.guild.id);
			if (adsprot['count(*)']) {
				if (!message.member.guild.me.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
					const npPerms = new MessageEmbed()
						.setColor(grabClient.utils.color(message.guild.me.displayHexColor))
						.addField(`**${grabClient.user.username} - Ads Protection**`,
							`**◎ Error:** I do not have the \`MANAGE_MESSAGES\` permissions. Disabling Ads Protection.`);
					message.channel.send({ embeds: [npPerms] }).then((m) => grabClient.utils.messageDelete(m, 0));
					db.prepare('DELETE FROM adsprot WHERE guildid = ?').run(message.guild.id);
					return;
				}
				if (!message.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
					const matches = urlRegexSafe({ strict: false }).test(message.content.toLowerCase());
					if (matches) {
						if (message.member.guild.me.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
							grabClient.utils.messageDelete(message, 0);
							message.channel.send(`**◎ Your message contained a link and it was deleted, ${message.author}**`)
								.then((msg) => {
									grabClient.utils.deletableCheck(msg, 10000);
								});
						}
					}
				}
			}
		}
		adsProt(this.client);

		// Link Mention Function
		async function linkTag(grabClient) {
			if (!message.content.startsWith(`${prefixcommand}reply`) && !message.content.startsWith(`${prefixcommand}sayreply`)) {
				const mainReg = /https:\/\/discordapp\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,18}/;
				const ptbReg = /https:\/\/ptb\.discordapp\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,18}/;
				const disReg = /https:\/\/discord\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,18}/;
				const ptReg = /https:\/\/ptb\.discord\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,18}/;
				const caReg = /https:\/\/canary\.discord\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,18}/;
				const canApReg = /https:\/\/canary\.discordapp\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,18}/;

				const mainCheck = mainReg.test(message.content.toLowerCase());
				const ptbCheck = ptbReg.test(message.content.toLowerCase());
				const disCheck = disReg.test(message.content.toLowerCase());
				const ptbdisCheck = ptReg.test(message.content.toLowerCase());
				const canCheck = caReg.test(message.content.toLowerCase());
				const canACheck = canApReg.test(message.content.toLowerCase());

				const exec = mainReg.exec(message.content.toLowerCase()) || ptbReg.exec(message.content.toLowerCase()) || disReg.exec(message.content.toLowerCase()) || ptReg.exec(message.content.toLowerCase()) || caReg.exec(message.content.toLowerCase()) || canApReg.exec(message.content.toLowerCase());

				let guildID;
				let channelID;
				let messageID;
				let URL;

				if (mainCheck || ptbCheck || disCheck || ptbdisCheck || canCheck || canACheck) {
					const mainGlob = /https:\/\/discordapp\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,18}/g;
					const ptbGlob = /https:\/\/ptb\.discordapp\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,18}/g;
					const disGlob = /https:\/\/discord\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,18}/g;
					const ptGlob = /https:\/\/ptb\.discord\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,18}/g;
					const caGlob = /https:\/\/canary\.discord\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,18}/g;
					const canAGlob = /https:\/\/canary\.discordapp\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,18}/g;


					let lengthMain;
					let lengthPtb;

					if (mainGlob.test(message.content.toLowerCase()) === true) {
						lengthMain = message.content.toLowerCase().match(mainGlob).length;
					} else {
						lengthMain = 0;
					}
					if (ptbGlob.test(message.content.toLowerCase()) === true) {
						lengthPtb = message.content.toLowerCase().match(ptbGlob).length;
					} else {
						lengthPtb = 0;
					}
					if (disGlob.test(message.content.toLowerCase()) === true) {
						lengthMain = message.content.toLowerCase().match(disGlob).length;
					} else {
						lengthMain = 0;
					}
					if (ptGlob.test(message.content.toLowerCase()) === true) {
						lengthPtb = message.content.toLowerCase().match(ptGlob).length;
					} else {
						lengthPtb = 0;
					}
					if (caGlob.test(message.content.toLowerCase()) === true) {
						lengthMain = message.content.toLowerCase().match(caGlob).length;
					} else {
						lengthMain = 0;
					}
					if (canAGlob.test(message.content.toLowerCase()) === true) {
						lengthPtb = message.content.toLowerCase().match(canAGlob).length;
					} else {
						lengthPtb = 0;
					}

					if (lengthMain + lengthPtb > 1) return;

					const mesLink = exec[0];
					if (mainCheck) {
						guildID = mesLink.substring(32, mesLink.length - 38);
						channelID = mesLink.substring(51, mesLink.length - 19);
						messageID = mesLink.substring(70);
						URL = `https://discordapp.com/channels/${guildID}/${channelID}/${messageID}`;
					} else if (ptbCheck) {
						guildID = mesLink.substring(36, mesLink.length - 38);
						channelID = mesLink.substring(55, mesLink.length - 19);
						messageID = mesLink.substring(74);
						URL = `https://ptb.discordapp.com/channels/${guildID}/${channelID}/${messageID}`;
					} else if (disCheck) {
						guildID = mesLink.substring(29, mesLink.length - 38);
						channelID = mesLink.substring(48, mesLink.length - 19);
						messageID = mesLink.substring(67);
						URL = `https://discord.com/channels/${guildID}/${channelID}/${messageID}`;
					} else if (ptbdisCheck) {
						guildID = mesLink.substring(33, mesLink.length - 38);
						channelID = mesLink.substring(52, mesLink.length - 19);
						messageID = mesLink.substring(71);
						URL = `https://ptb.discord.com/channels/${guildID}/${channelID}/${messageID}`;
					} else if (canCheck) {
						guildID = mesLink.substring(36, mesLink.length - 38);
						channelID = mesLink.substring(55, mesLink.length - 19);
						messageID = mesLink.substring(74);
						URL = `https://canary.discord.com/channels/${guildID}/${channelID}/${messageID}`;
					} else if (canACheck) {
						guildID = mesLink.substring(39, mesLink.length - 38);
						channelID = mesLink.substring(58, mesLink.length - 19);
						messageID = mesLink.substring(77);
						URL = `https://canary.discordapp.com/channels/${guildID}/${channelID}/${messageID}`;
					}

					if (!guildID) {
						return;
					}
					if (!channelID) {
						return;
					}
					if (!messageID) {
						return;
					}
					const embed = new MessageEmbed()
						.setAuthor({ name: `${message.author.username}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
						.setColor(grabClient.utils.color(message.guild.me.displayHexColor))
						.setFooter({ text: `Req. by ${message.author.username}` })
						.setTimestamp();
					if (message.guild.id === guildID) {
						const findGuild = grabClient.guilds.cache.get(guildID);
						const findChannel = findGuild.channels.cache.get(channelID);
						const validExtensions = ['gif', 'png', 'jpeg', 'jpg'];

						await findChannel.messages.fetch(messageID).then((res) => {
							if (res) {
								if (res.embeds[0]) { // fail bruh
									if (res.embeds[0].url) {
										const fileExtension = res.embeds[0].url.substring(res.embeds[0].url.lastIndexOf('.') + 1);
										if (validExtensions.includes(fileExtension)) {
											embed.setDescription(`**◎ [Message Link](${URL}) to** ${res.channel}\n${res.content.length > 1048 ? res.content.substring(0, 1048) : res.content}`);
											embed.setImage(res.embeds[0].url);
											message.channel.send({ embeds: [embed] });
										}
										return;
									} else {
										return;
									}
								}

								const attachmentCheck = res.attachments.first();
								if (attachmentCheck && res.content !== '') {
									const attachmentUrl = res.attachments.first().url;
									const fileExtension = attachmentUrl.substring(attachmentUrl.lastIndexOf('.') + 1);
									if (!validExtensions.includes(fileExtension)) {
										embed.setDescription(`**◎ [Message Link](${URL}) to** ${res.channel}\n${res.content.substring(0, 1048)}`);
										return;
									} else {
										embed.setDescription(`**◎ [Message Link](${URL}) to** ${res.channel}\n${res.content.substring(0, 1048)}`);
										embed.setImage(attachmentUrl);
										message.channel.send({ embeds: [embed] });
										return;
									}
								}
								if (attachmentCheck) {
									const attachmentUrl = res.attachments.first().url;
									const fileExtension = attachmentUrl.substring(attachmentUrl.lastIndexOf('.') + 1);
									if (!validExtensions.includes(fileExtension)) {
										return;
									} else {
										embed.setDescription(`**◎ [Message Link](${URL}) to** ${res.channel}`);
										embed.setImage(attachmentUrl);
										message.channel.send({ embeds: [embed] });
										return;
									}
								} else {
									embed.setDescription(`**◎ [Message Link](${URL}) to** ${res.channel}\n${res.content.substring(0, 1048)}`);
									message.channel.send({ embeds: [embed] });
									return;
								}
							}
						}).catch((e) => {
							console.error(e);
						});
					}
				}
			}
		}
		linkTag(this.client);

		const mentionRegex = RegExp(`^<@!?${this.client.user.id}>$`);

		if (message.content.match(mentionRegex)) {
			message.channel.send(`**◎ My prefix for ${message.guild.name} is \`${prefixcommand}\`.**`);
			return;
		}

		async function chatBot(grabClient) {
			const apiArgs = message.content.slice().trim().split(/ +/g);
			apiArgs.splice(0, 1);

			if (message.guild) {
				if (message.author.bot) return;
				if (message.content.startsWith(`<@${grabClient.user.id}>`) || message.content.startsWith(`<@!${grabClient.user.id}>`)) {
					if (!apiArgs.length) return;

					message.channel.sendTyping();

					try {
						await fetch.default(`https://api.affiliateplus.xyz/api/chatbot?message=${apiArgs.join('%20')}&botname=Ragnarok&ownername=Ragnar&user=${message.author.id}`)
							.then(res => res.json())
							.then(json => message.reply({ content: json.message, allowedMentions: { repliedUser: false } }));
					} catch {
						message.reply({ content: 'I am unable to connect to the chat API. Please try again later.' });
						return;
					}
				}
			}
		}
		chatBot(this.client);

		if (!message.content.startsWith(prefixcommand)) return;

		if (command) {
			if (command.ownerOnly && !this.client.utils.checkOwner(message.author.id)) {
				return;
			}

			const userPermCheck = command.userPerms ? this.client.defaultPerms.add(command.userPerms) : this.client.defaultPerms;
			if (!this.client.utils.checkOwner(message.author.id) && userPermCheck) {
				const missing = message.channel.permissionsFor(message.member).missing(userPermCheck);
				if (missing.length) {
					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - ${this.client.utils.capitalise(command.name)}**`,
							`**◎ Error:** You are missing \`${this.client.utils.formatArray(missing.map(this.client.utils.formatPerms))}\` permissions, they are required for this command.`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}
			}

			const botPermCheck = command.botPerms ? this.client.defaultPerms.add(command.botPerms) : this.client.defaultPerms;
			if (botPermCheck) {
				const missing = message.channel.permissionsFor(this.client.user).missing(botPermCheck);
				if (missing.length) {
					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - ${this.client.utils.capitalise(command.name)}**`,
							`**◎ Error:** I am missing \`${this.client.utils.formatArray(missing.map(this.client.utils.formatPerms))}\` permissions, they are required for this command.`);
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}
			}
			command.run(message, args);
		} else {
			return;
		}

		// Logging
		if (this.client.logging === true) {
			const nowInMs = Date.now();
			const nowInSecond = Math.round(nowInMs / 1000);

			const logembed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor));

			if (!oargresult || oargresult === '') {
				logembed.addField(`Guild: ${message.guild.name} | Date: <t:${nowInSecond}>`,
					Formatters.codeBlock('kotlin', `'${cmd}' was executed by ${message.author.tag}`));
				const LoggingNoArgs = `[\x1b[31m${moment().format('LLLL')}\x1b[0m] '\x1b[92m${cmd}\x1b[0m' was executed by \x1b[31m${message.author.tag}\x1b[0m (Guild: \x1b[31m${message.guild.name}\x1b[0m)`;
				this.client.channels.cache.get('694680953133596682').send({ embeds: [logembed] });
				console.log(LoggingNoArgs);
			} else {
				logembed.addField(`Guild: ${message.guild.name} | Date: <t:${nowInSecond}>`,
					Formatters.codeBlock('kotlin', `'${cmd} ${oargresult}' was executed by ${message.author.tag}`));
				const LoggingArgs = `[\x1b[31m${moment().format('LLLL')}\x1b[0m] '\x1b[92m${cmd} ${oargresult}\x1b[0m' was executed by \x1b[31m${message.author.tag}\x1b[0m (Guild: \x1b[31m${message.guild.name}\x1b[0m)`;
				this.client.channels.cache.get('694680953133596682').send({ embeds: [logembed] });
				console.log(LoggingArgs);
			}
		}

		// Logging command exectuion
		const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${message.guild.id};`).get();
		if (!id) return;

		const logs = id.channel;
		if (!logs) return;

		if (id) {
			if (id.channel === null) {
				db.prepare(`DELETE FROM logging WHERE guildid = ${message.guild.id}`).run();
				return;
			}
			if (!message.guild.channels.cache.find((channel) => channel.id === id.channel)) {
				db.prepare(`DELETE FROM logging WHERE guildid = ${message.guild.id}`).run();
				return;
			}
			const ch = message.guild.channels.cache.get(logs);
			if (!message.guild.me.permissionsIn(ch).has('SEND_MESSAGES')) {
				return;
			}
		}

		const logembed = new MessageEmbed()
			.setAuthor({ name: `${message.author.tag}`, iconURL: message.guild.iconURL() })
			.setDescription(`**◎ Used** \`${cmd}\` **command in ${message.channel}**\n${Formatters.codeBlock('yaml', `${prefixcommand}${cmd} ${oargresult}`)}`)
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.setFooter({ text: `ID: ${message.channel.id}` })
			.setTimestamp();
		this.client.channels.cache.get(logs).send({ embeds: [logembed] });
	}

};
