/* eslint-disable no-inline-comments */
/* eslint-disable no-mixed-operators */
const Event = require('../../Structures/Event');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const coinCooldown = new Set();
const coinCooldownSeconds = 30;
const xpCooldown = new Set();
const xpCooldownSeconds = 60;

module.exports = class extends Event {

	async run(message) {
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

		// Prefix command

		if (message.content.toLowerCase() === `${this.client.prefix}prefix`) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.setDescription(`**◎ This guild's prefix is:** \`${prefixcommand}\``);
			message.channel.send(embed);
			return;
		}

		// Balance (balance)
		if (message.author.bot) return;
		let balance;
		if (message.guild) {
			balance = this.client.getBalance.get(message.author.id, message.guild.id);
			if (!balance) {
				balance = {
					user: message.author.id,
					guild: message.guild.id,
					cash: 0,
					bank: 1000,
					total: 1000
				};
			}
			const curBal = balance.cash;
			const curBan = balance.bank;
			const coinAmt = Math.floor(Math.random() * (60 - 20 + 1) + 20); // * (max - min + 1) + min);
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
						level: 0
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
						.setAuthor(`Congratulations ${message.author.username}`)
						.setThumbnail('https://ya-webdesign.com/images250_/surprised-patrick-png-7.png')
						.setColor(grabClient.utils.color(message.guild.me.displayHexColor))
						.setDescription(`**You have leveled up!**\nNew Level: \`${curlvl + 1}\``);
					message.channel.send(lvlup).then((m) => grabClient.utils.deletableCheck(m, 10000));
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
			if (message.content.toLowerCase().startsWith('im ') || message.content.toLowerCase().startsWith('i\'m ')) {
				const dadbot = db.prepare(`SELECT * FROM dadbot WHERE guildid = ${message.guild.id};`).get();
				if (!dadbot) {
					return;
				}
				if (args.length > 10) {
					return;
				}
				if (args[0] === undefined) {
					return;
				}
				if (message.content.includes('https://')) {
					message.channel.send('Hi unloved virgin, I\'m Dad!');
				} else if (message.content.includes('http://')) {
					message.channel.send('Hi unloved virgin, I\'m Dad!');
				} else if (message.content.includes('discord.gg')) {
					message.channel.send('Hi unloved virgin, I\'m Dad!');
				} else if (message.content.includes('discord.me')) {
					message.channel.send('Hi unloved virgin, I\'m Dad!');
				} else if (message.content.includes('discord.io')) {
					message.channel.send('Hi unloved virgin, I\'m Dad!');
				} else if (message.content.includes('@everyone')) {
					message.channel.send('Hi unloved virgin, I\'m Dad!');
				} else if (message.content.includes('@here')) {
					message.channel.send('Hi unloved virgin, I\'m Dad!');
				} else if (message.content.toLowerCase().includes('`')) {
					message.channel.send('Hi unloved virgin, I\'m Dad!');
				} else if (
					message.content.toLowerCase().startsWith('im dad') || message.content.toLowerCase().startsWith('i\'m dad')) {
					message.channel.send('No, I\'m Dad!');
				} else {
					message.channel.send(`Hi ${oargresult}, I'm Dad!`);
				}
			}
		}

		dadBot();

		// Ads protection checks
		function adsProt(grabClient) {
			if (!message.content.startsWith(`${prefixcommand}play`)) {
				const adsprot = db.prepare('SELECT count(*) FROM adsprot WHERE guildid = ?').get(message.guild.id);
				if (adsprot['count(*)']) {
					if (!message.member.guild.me.hasPermission('MANAGE_MESSAGES')) {
						const npPerms = new MessageEmbed()
							.setColor(grabClient.utils.color(message.guild.me.displayHexColor))
							.addField(`**${grabClient.user.username} - Ads Protection**`,
								`**◎ Error:** I do not have the \`MANAGE_MESSAGES\` permissions. Disabling Ads Protection.`);
						message.channel.send(npPerms).then((m) => grabClient.utils.messageDelete(m, 0));
						db.prepare('DELETE FROM adsprot WHERE guildid = ?').run(message.guild.id);
						return;
					}
					if (!message.member.hasPermission('MANAGE_MESSAGES')) {
						if (message.content.includes('https://') || message.content.includes('http://') || message.content.includes('discord.gg') || message.content.includes('discord.me') || message.content.includes('discord.io')) {
							// eslint-disable-next-line max-depth
							if (message.member.guild.me.hasPermission('MANAGE_MESSAGES')) {
								// eslint-disable-next-line arrow-body-style
								grabClient.utils.messageDelete(message, 0);
							}
							message.channel.send(`**◎ Your message contained a link and it was deleted, <@${message.author.id}>**`)
								.then((msg) => {
									grabClient.utils.messageDelete(msg, 10000);
								});
						}
					}
				}
			}
		}
		adsProt(this.client);

		// Link Mention Function
		async function linkTag(grabClient) {
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
					.setAuthor(`${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
					.setColor(grabClient.utils.color(message.guild.me.displayHexColor))
					.setFooter(`Req. by ${message.author.username}`)
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
										embed.setDescription(`**◎ [Message Link](${URL}) to** ${res.channel}\n${res.content}`);
										embed.setImage(res.embeds[0].url);
										message.channel.send(embed);
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
									embed.setDescription(`**◎ [Message Link](${URL}) to** ${res.channel}\n${res.content}`);
									return;
								} else {
									embed.setDescription(`**◎ [Message Link](${URL}) to** ${res.channel}\n${res.content}`);
									embed.setImage(attachmentUrl);
									message.channel.send(embed);
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
									message.channel.send(embed);
									return;
								}
							} else {
								embed.setDescription(`**◎ [Message Link](${URL}) to** ${res.channel}\n${res.content}`);
								message.channel.send(embed);
								return;
							}
						}
					}).catch((e) => {
						console.log(e);
					});
				}
			}
		}
		linkTag(this.client);

		// Chat Filter
		/* if (this.client.filterList.some(word => message.content.toLowerCase().includes(` ${word} `))) {
		this.client.utils.messageDelete(message, 0);
			message.channel.send('BOI THAT"S A BLOCKED WORD!');
		}*/

		const mentionRegex = RegExp(`^<@!${this.client.user.id}>$`);

		if (message.content.match(mentionRegex)) message.channel.send(`**◎ My prefix for ${message.guild.name} is \`${this.client.prefix}\`.**`);

		if (!message.content.startsWith(prefixcommand)) return;

		if (command) {
			if (command.ownerOnly) {
				if (!this.client.owners.includes(message.author.id)) {
					return;
				}
			}
			if (command.requiredPermission) {
				if (!message.member.hasPermission(command.requiredPermission) && !this.client.owners.includes(message.author.id)) {
					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - ${this.client.utils.capitalise(command.name)}**`,
							`**◎ Error:** You need the \`${command.requiredPermission}\` role in order to execute this command.`);
					message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}
			}
			command.run(message, args);
		} else {
			return;
		}

		// Logging
		if (this.client.logging === true) {
			if (!oargresult || oargresult === '') {
				const LoggingNoArgs = `[\x1b[31m${moment().format('LLLL')}\x1b[0m] Command \`${cmd}\` was executed by \x1b[31m${message.author.tag}\x1b[0m (Guild: \x1b[31m${message.guild.name}\x1b[0m)`;
				if (this.client.user.id === '508756879564865539') {
					this.client.channels.cache.get('694680953133596682').send(`${cmd} - was executed by ${message.author.tag} - In guild: ${message.guild.name}`, { code: 'css' });
				}
				console.log(LoggingNoArgs);
			} else {
				const LoggingArgs = `[\x1b[31m${moment().format('LLLL')}\x1b[0m] Command \`${cmd} ${oargresult}\` was executed by \x1b[31m${message.author.tag}\x1b[0m (Guild: \x1b[31m${message.guild.name}\x1b[0m)`;
				if (this.client.user.id === '508756879564865539') {
					this.client.channels.cache.get('694680953133596682').send(`${cmd} ${oargresult} - was executed by ${message.author.tag} - In guild: ${message.guild.name}`, { code: 'css' });
				}
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
		}
		const logembed = new MessageEmbed()
			.setAuthor(message.author.tag, message.guild.iconURL())
			.setDescription(`**◎ Used** \`${cmd}\` **command in ${message.channel}**\n\`${prefixcommand}${cmd} ${oargresult}\``)
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.setFooter(`ID: ${message.channel.id}`)
			.setTimestamp();
		this.client.channels.cache.get(logs).send(logembed);
	}

};
