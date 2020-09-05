/* eslint-disable id-length */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
/* eslint-disable no-mixed-operators */
const Command = require('../../Structures/Command');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const abbreviate = require('number-abbreviate');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
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
			usage: '[@user]'
		});
	}

	async run(message) {
		const levelDb = db.prepare(`SELECT status FROM level WHERE guildid = ${message.guild.id};`).get();
		if (levelDb) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Level**`,
					`**◎ Error:** Level system is disabled for this guild!`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		this.client.getScore = db.prepare('SELECT * FROM scores WHERE user = ? AND guild = ?');
		this.client.setScore = db.prepare('INSERT OR REPLACE INTO scores (id, user, guild, points, level) VALUES (@id, @user, @guild, @points, @level);');

		const user = message.mentions.users.first() || message.author;
		if (user.bot) return;

		let colorGrab;
		if (message.mentions.users.first()) {
			colorGrab = this.client.utils.color(message.mentions.members.first().displayHexColor);
		} else {
			colorGrab = this.client.utils.color(message.member.displayHexColor);
		}

		let score;
		if (message.guild) {
			score = this.client.getScore.get(user.id, message.guild.id);
		}

		if (!score) {
			const xpAdd = Math.floor(Math.random() * (25 - 15 + 1) + 15); // Random amount between 15 - 25
			const newData = {
				id: `${message.guild.id}-${message.author.id}`,
				user: message.author.id,
				guild: message.guild.id,
				points: xpAdd,
				level: 0
			};
			await this.client.setScore.run(newData);
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
		if (user.presence.status === 'online') {
			userStatusColor = '#43B581';
		} else if (user.presence.status === 'idle') {
			userStatusColor = '#FAA61A';
		} else if (user.presence.status === 'dnd') {
			userStatusColor = '#F04747';
		} else if (user.presence.status === 'offline') {
			userStatusColor = '#737F8D';
		}
		const background = await Canvas.loadImage(
			'./Storage/Canvas/Images/level.png'
		);

		ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

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
				({
					x: this.x, y: this.y, width: this.w, height: this.h
				} = dimension);
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
		message.channel.send(attachment).catch((err) => console.log(err));
	}

};
