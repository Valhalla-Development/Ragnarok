/* eslint-disable id-length */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
/* eslint-disable no-mixed-operators */
const Command = require('../../Structures/Command');
const { MessageAttachment, EmbedBuilder } = require('discord.js');
const abbreviate = require('number-abbreviate');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const { parse } = require('twemoji-parser');
const countryList = require('countries-list');
const fetch = require('node-fetch-cjs');
const Canvas = require('canvas');
Canvas.registerFont('./Storage/Canvas/Fonts/Shapirit.otf', {
	family: 'Shapirit'
});

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['rank'],
			description: 'Displays level of message author/tagged user.',
			category: 'Fun',
			usage: '[@user] [image <URL> [off]] [country <country-code> [off]]',
			botPerms: ['AttachFiles']
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const levelDb = db.prepare(`SELECT status FROM level WHERE guildid = ${message.guild.id};`).get();

		if (levelDb) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addFields({ name: `**${this.client.user.username} - Level**`,
					value: `**◎ Error:** Level system is disabled for this guild!` });
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		this.client.getScore = db.prepare('SELECT * FROM scores WHERE user = ? AND guild = ?');
		this.client.setScore = db.prepare('INSERT OR REPLACE INTO scores (id, user, guild, points, level, country, image) VALUES (@id, @user, @guild, @points, @level, @country, @image);');

		if (args[0] === 'country') {
			if (!args[1]) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new EmbedBuilder()
					.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
					.addFields({ name: `**${this.client.user.username} - Level**`,
						value: `**◎ Error:** Incorrect usage! An example of this command would be: \`${prefix}level country UK\`` });
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			let score;
			if (message.guild) {
				score = this.client.getScore.get(message.author.id, message.guild.id);
			}

			if (!score) {
				const xpAdd = Math.floor(Math.random() * (25 - 15 + 1) + 15);
				const newData = {
					id: `${message.guild.id}-${message.author.id}`,
					user: message.author.id,
					guild: message.guild.id,
					points: xpAdd,
					level: 0,
					country: null,
					image: null
				};
				await this.client.setScore.run(newData);
			}

			if (args[1] === 'off') {
				if (score && !score.country) {
					const embed = new EmbedBuilder()
						.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
						.addFields({ name: `**${this.client.user.username} - Level**`,
							value: `**◎ Error:** You do not have a country set.` });
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				} else {
					const embed = new EmbedBuilder()
						.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
						.addFields({ name: `**${this.client.user.username} - Level**`,
							value: `**◎ Success:** I have disabled your country flag!` });
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));

					score.country = null;
					await this.client.setScore.run(score);
					return;
				}
			}

			try {
				const fetchCountry = countryList.countries[args[1].toUpperCase()];
				const url = await parse(fetchCountry.emoji);

				score.country = url[0].url;
				await this.client.setScore.run(score);

				this.client.utils.messageDelete(message, 10000);
				const embed = new EmbedBuilder()
					.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
					.addFields({ name: `**${this.client.user.username} - Level**`,
						value: `**◎ Success:** You selected \`${fetchCountry.name}\`` });
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			} catch {
				this.client.utils.messageDelete(message, 10000);

				const embed = new EmbedBuilder()
					.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
					.addFields({ name: `**${this.client.user.username} - Config**`,
						value: `**◎ Error:** Did you input a valid country code? Your input was: \`${args[1].toUpperCase()}\`\nYou can find your country code here: https://www.countrycode.org/\nPlease input the '2 DIGIT ISO' within your country page.` });
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
		}

		if (args[0] === 'image') {
			let score;
			if (message.guild) {
				score = this.client.getScore.get(message.author.id, message.guild.id);
			}

			if (!score) {
				const xpAdd = Math.floor(Math.random() * (25 - 15 + 1) + 15);
				const newData = {
					id: `${message.guild.id}-${message.author.id}`,
					user: message.author.id,
					guild: message.guild.id,
					points: xpAdd,
					level: 0,
					country: null,
					image: null
				};
				await this.client.setScore.run(newData);
			}

			if (message.guild.id) {
				if (args[1] === 'off') {
					if (!score.image) {
						this.client.utils.messageDelete(message, 10000);

						const embed = new EmbedBuilder()
							.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
							.addFields({ name: `**${this.client.user.username} - Level**`,
								value: `**◎ Error:** You have no custom image enabled!` });
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					} else {
						const update = db.prepare('UPDATE scores SET image = (@image) WHERE user = (@user);');
						update.run({
							user: `${message.author.id}`,
							image: null
						});

						this.client.utils.messageDelete(message, 10000);

						const embed = new EmbedBuilder()
							.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
							.addFields({ name: `**${this.client.user.username} - Level**`,
								value: `**◎ Success:** Custom image has been disabled!` });
						message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						return;
					}
				}

				if (!args[1]) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new EmbedBuilder()
						.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
						.addFields({ name: `**${this.client.user.username} - Level**`,
							value: `**◎ Error:** Incorrect Usage! An example of this command would be: \`${prefix}level image <url-to-image>\` or to disable: \`${prefix}level image off\`` });
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				const urlExtension = args[1].substring(args[1].lastIndexOf('.') + 1);
				const validExtensions = ['jpg', 'jpeg', 'png'];

				if (!validExtensions.includes(urlExtension)) {
					this.client.utils.messageDelete(message, 10000);

					const invalidExt = new EmbedBuilder()
						.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
						.addFields({ name: `**${this.client.user.username} - Level**`,
							value: `**◎ Error:** \`.${urlExtension}\` is not a valid image type!\n\n**Acceptable files:**\n\`${validExtensions.join(', ')}\`` });
					message.channel.send({ embeds: [invalidExt] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				const urlRegex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;

				if (!urlRegex.test(args[1])) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new EmbedBuilder()
						.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
						.addFields({ name: `**${this.client.user.username} - Level**`,
							value: `**◎ Error:** Please enter a valid URL, the URL must be absolute! An example of an absolute URL would be: https://www.google.com` });
					message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				await fetch.default(args[1])
					.then(async res => {
						if (res.ok) {
							try {
								await Canvas.loadImage(args[1]);
							} catch {
								this.client.utils.messageDelete(message, 10000);

								const invalidExt = new EmbedBuilder()
									.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
									.addFields({ name: `**${this.client.user.username} - Level**`,
										value: `**◎ Error:** I was unable to process \`${args[1]}\`\nIs it a valid image?` });
								message.channel.send({ embeds: [invalidExt] }).then((m) => this.client.utils.deletableCheck(m, 10000));
								return;
							}

							const update = db.prepare('UPDATE scores SET image = (@image) WHERE user = (@user);');
							update.run({
								user: `${message.author.id}`,
								image: args[1]
							});
							this.client.utils.messageDelete(message, 0);

							const embed = new EmbedBuilder()
								.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
								.setImage(args[1])
								.addFields({ name: `**${this.client.user.username} - Level**`,
									value: `**◎ Success:** Image has been updated to the following.` });
							message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
							return;
						} else {
							this.client.utils.messageDelete(message, 10000);

							const embed = new EmbedBuilder()
								.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
								.addFields({ name: `**${this.client.user.username} - Level**`,
									value: `**◎ Error:** Please enter a valid image URL! The end of the URL must end with one of the supported extensions. (\`.jpg, .jpeg, .png\`)` });
							message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
							return;
						}
					});

				return;
			}
		}

		let user;
		try {
			user = message.mentions.users.size ? message.mentions.members.first().user : args[0] ? message.guild.members.members.cache.find(usr => usr.displayName === args.join(' ')).user : message.author;
		} catch {
			user = null;
		}

		if (user === null) {
			this.client.utils.messageDelete(message, 10000);

			const limitE = new EmbedBuilder()
				.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addFields({ name: `**${this.client.user.username} - Balance**`,
					value: `**◎ Error:** I could not find the specified user!` });
			message.channel.send({ embeds: [limitE] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (user.bot) return;

		const colorGrab = this.client.utils.color(message.guild.members.members.cache.find(grabUser => grabUser.id === user.id).displayHexColor);
		let score;

		if (message.guild) {
			score = this.client.getScore.get(user.id, message.guild.id);
		}

		if (!score) {
			// Random amount between 15 - 25
			const xpAdd = Math.floor(Math.random() * (25 - 15 + 1) + 15);
			const newData = {
				id: `${message.guild.id}-${message.author.id}`,
				user: message.author.id,
				guild: message.guild.id,
				points: xpAdd,
				level: 0,
				country: null,
				image: null
			};
			await this.client.setScore.run(newData);
		}

		let levelImg;
		if (score.image) {
			await fetch.default(score.image)
				.then(res => {
					if (res.ok) {
						levelImg = score.image;
					} else {
						levelImg = './Storage/Canvas/Images/level.png';
					}
				});
		} else {
			levelImg = './Storage/Canvas/Images/level.png';
		}

		let level;
		let points;
		let levelNoMinus;
		let nxtLvlXp;
		let currentxpLvl;
		let currentLvl;
		let toLevel;
		let inLevel;
		let xpLevel;
		let xpPercent;
		if (!score) {
			level = '0';
			points = '0';
			toLevel = '100';
			inLevel = '0';
			xpLevel = '0/100 XP';
			xpPercent = 0;
		} else {
			level = score.level;
			points = score.points;
			levelNoMinus = score.level + 1;
			currentLvl = score.level;
			nxtLvlXp = 5 / 6 * levelNoMinus * (2 * levelNoMinus * levelNoMinus + 27 * levelNoMinus + 91);
			currentxpLvl = 5 / 6 * currentLvl * (2 * currentLvl * currentLvl + 27 * currentLvl + 91);
			toLevel = Math.floor(nxtLvlXp - currentxpLvl);
			inLevel = Math.floor(points - currentxpLvl);
			xpLevel = `${abbreviate(inLevel, 2)}/${abbreviate(toLevel, 2)} XP`;
			xpPercent = inLevel / toLevel * 100;
		}

		const userRank = db.prepare('SELECT count(*) FROM scores WHERE points >= ? AND guild = ? AND user ORDER BY points DESC').all(points, message.guild.id);
		const canvas = Canvas.createCanvas(934, 282);
		const ctx = canvas.getContext('2d');

		// Presence colors
		let userStatusColor;

		const fetchUser = await message.guild.members.members.fetch(user.id);

		if (!fetchUser.presence) {
			userStatusColor = '#737F8D';
		} else if (fetchUser.presence.status === 'online') {
			userStatusColor = '#43B581';
		} else if (fetchUser.presence.status === 'idle') {
			userStatusColor = '#FAA61A';
		} else if (fetchUser.presence.status === 'dnd') {
			userStatusColor = '#F04747';
		} else if (fetchUser.presence.status === 'offline') {
			userStatusColor = '#737F8D';
		}
		const background = await Canvas.loadImage(levelImg);

		ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
		ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
		ctx.fillRect(0, 0, 934, 282);
		ctx.save();

		// Function to create rounded rectangles
		function roundRect(x, y, w, h, radius) {
			ctx.save();
			var r = x + w;
			var b = y + h;
			ctx.beginPath();
			ctx.globalAlpha = 0.45;
			ctx.fillStyle = 'black';
			ctx.strokeStyle = 'black';
			ctx.lineWidth = '0.75';
			ctx.moveTo(x + radius, y);
			ctx.lineTo(r - radius, y);
			ctx.quadraticCurveTo(r, y, r, y + radius);
			ctx.lineTo(r, y + h - radius);
			ctx.quadraticCurveTo(r, b, r - radius, b);
			ctx.lineTo(x + radius, b);
			ctx.quadraticCurveTo(x, b, x, b - radius);
			ctx.lineTo(x, y + radius);
			ctx.quadraticCurveTo(x, y, x + radius, y);
			ctx.closePath();
			ctx.stroke();
			ctx.fill();
			ctx.restore();
		}

		// rectangle around rank and level
		roundRect(511.5, 48.6, 376, 59, 10);

		// rectangle around username and xp
		roundRect(259.8, 133, 628.4, 42, 10);

		// reactangle around progress bar
		roundRect(259.8, 182.62, 628.4, 36.5, 20);

		// Levels / Ranks
		const levelNumber = level;
		const levelText = 'LEVEL';
		const rankNumber = `#${userRank[0]['count(*)']}`;
		const rankText = 'RANK';
		const usergrab = user.username;
		const discrim = `#${user.discriminator}`;
		const avatarGrab = user.displayAvatarURL({ format: 'png' });

		class ProgressBar {

			constructor(dimension, color, percentage) {
				({ x: this.x, y: this.y, width: this.w, height: this.h } = dimension);
				this.color = color;
				this.percentage = percentage / 100;
				this.p;
			}

			draw() {
				this.p = this.percentage * this.w;
				if (this.p <= this.h) {
					ctx.beginPath();
					ctx.arc(this.h / 2 + this.x, this.h / 2 + this.y, this.h / 2, Math.PI - Math.acos((this.h - this.p) / this.h), Math.PI + Math.acos((this.h - this.p) / this.h));
					ctx.save();
					ctx.scale(-1, 1);
					ctx.arc((this.h / 2) - this.p - this.x, this.h / 2 + this.y, this.h / 2, Math.PI - Math.acos((this.h - this.p) / this.h), Math.PI + Math.acos((this.h - this.p) / this.h));
					ctx.restore();
					ctx.closePath();
				} else {
					ctx.beginPath();
					ctx.arc(this.h / 2 + this.x, this.h / 2 + this.y, this.h / 2, Math.PI / 2, 3 / 2 * Math.PI);
					ctx.lineTo(this.p - this.h + this.x, 0 + this.y);
					ctx.arc(this.p - (this.h / 2) + this.x, this.h / 2 + this.y, this.h / 2, 3 / 2 * Math.PI, Math.PI / 2);
					ctx.lineTo(this.h / 2 + this.x, this.h + this.y);
					ctx.closePath();
				}
				ctx.fillStyle = this.color;
				ctx.fill();
			}

		}

		const progressbar = new ProgressBar({
			x: 259.8, y: 182.62, width: 628.4, height: 36.5
		}, colorGrab, xpPercent);
		progressbar.draw();


		// Draw XP
		function drawXP(x, y, xp) {
			ctx.font = '22px Shapirit';
			ctx.fillStyle = '#FFFFFF';
			ctx.textAlign = 'right';
			ctx.strokeStyle = 'black';
			ctx.lineWidth = 0.25;
			ctx.fillText(xp, x, y);
			ctx.strokeText(xp, x, y);
			ctx.save();
		}
		drawXP(880, 165.4, xpLevel);

		function drawEmote(x, y, img) {
			ctx.drawImage(img, x, y, 50, 50);
		}

		if (score && score.country) {
			try {
				const img = await Canvas.loadImage(score.country);
				// Draw Contry Emoji
				drawEmote(450, 54.3, img);
			} catch {
			// do nothing
			}
		}

		// Draw Percentage
		function drawPercent(x, y, input) {
			ctx.font = '34px Shapirit';
			ctx.textAlign = 'center';
			ctx.strokeStyle = 'blue';
			ctx.lineWidth = 0.5;
			ctx.fillText(input, x, y);
			ctx.strokeText(input, x, y);
		}

		drawPercent(570, 212, `${xpPercent.toFixed(1)}%`);

		// Draw level
		function drawLevel(x, y, txt, num, style) {
			ctx.font = '48px Shapirit';
			ctx.fillStyle = style;
			ctx.textAlign = 'right';
			ctx.strokeStyle = 'black';
			ctx.lineWidth = 0.5;
			ctx.fillText(num, x, y);
			ctx.strokeText(num, x, y);
			const w = ctx.measureText(num).width;

			ctx.font = '22px Shapirit';
			ctx.fillStyle = style;
			ctx.textAlign = 'right';
			ctx.strokeStyle = 'black';
			ctx.lineWidth = 0.25;
			ctx.fillText(txt, x - w - 4, y);
			ctx.strokeText(txt, x - w - 4, y);
			ctx.save();
		}

		drawLevel(880, 96.8, levelText, levelNumber, '#FF1700');

		// Draw rank
		ctx.font = '22px Shapirit';
		ctx.fillStyle = '#FFFFFF';
		ctx.textAlign = 'left';
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 0.25;
		ctx.fillText(rankText, 522.5, 96.8);
		ctx.strokeText(rankText, 522.5, 96.8);

		ctx.font = '48px Shapirit';
		ctx.fillStyle = '#FFFFFF';
		ctx.textAlign = 'left';
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 0.5;
		ctx.fillText(rankNumber, 522.5 + 64.5, 96.8);
		ctx.strokeText(rankNumber, 522.5 + 64.5, 96.8);
		ctx.save();

		// Draw Username

		function drawUsername(x, y, max, use, dis) {
			ctx.font = '34px Shapirit';
			ctx.fillStyle = '#FFFFFF';
			ctx.textAlign = 'left';
			ctx.strokeStyle = 'black';
			ctx.lineWidth = 0.5;
			while (ctx.measureText(use).width > max) {
				use = use.substring(0, use.length - 1);
			}
			ctx.fillText(use, x, y);
			ctx.strokeText(use, x, y);
			const w = ctx.measureText(use).width;

			ctx.font = '22px Shapirit';
			ctx.fillStyle = '#7F8384';
			ctx.textAlign = 'left';
			ctx.strokeStyle = 'black';
			ctx.lineWidth = 0.25;
			ctx.fillText(dis, x + w + 4, y);
			ctx.strokeText(dis, x + w + 4, y);
			ctx.save();
		}

		drawUsername(270, 165.4, 364, usergrab, discrim);

		// circle around avatar
		ctx.beginPath();
		ctx.arc(122.5, 141.8, 81, 0, Math.PI * 2, true);
		ctx.strokeStyle = colorGrab;
		ctx.lineWidth = 6;
		ctx.stroke();
		ctx.save();
		ctx.closePath();
		ctx.clip();
		const avatar = await Canvas.loadImage(
			avatarGrab
		);
		ctx.strokeStyle = colorGrab;
		ctx.strokeRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(avatar, 41.5, 60.5, 162, 162);

		// presence circle
		ctx.restore();
		ctx.beginPath();
		ctx.arc(184.5, 193.5, 19, 0, Math.PI * 2, true);
		ctx.strokeStyle = '#000000';
		ctx.lineWidth = 8;
		ctx.stroke();
		ctx.fillStyle = userStatusColor;
		ctx.fill();
		ctx.save();

		const attachment = new MessageAttachment(canvas.toBuffer(), 'level.jpg');
		message.channel.send({ files: [attachment] }).catch((err) => console.error(err));
	}

};
