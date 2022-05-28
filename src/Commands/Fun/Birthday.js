const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const moment = require('moment');
const ms = require('ms');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['bday'],
			description: 'The ability to set your birthday',
			category: 'Fun',
			usage: '<MM/DD/YYYY>'
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const birthdayConfigDB = db.prepare(`SELECT * FROM birthdayConfig WHERE guildid = ${message.guild.id};`).get();

		const user = message.mentions.members.first() || message.guild.members.cache.find((a) => a.id === args[0]) || message.member;

		const birthdayDB = db.prepare(`SELECT * FROM birthdays WHERE userid = ${user.id};`).get();

		if (!birthdayConfigDB && birthdayDB) {
			let year;

			const bdayNow = moment();
			const nextBirthday = birthdayDB.birthday.slice(0, birthdayDB.birthday.length - 4);

			const birthdayNext = new Date(nextBirthday + bdayNow.year());
			const getNow = new Date();
			if (birthdayNext > getNow) {
				year = bdayNow.year();
			} else {
				year = bdayNow.year() + 1;
			}

			const then = moment(nextBirthday + year);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Birthday**`,
					`**◎** ${user}'s **next** birthday is in **${ms(then - bdayNow, { long: true })}**, on **${nextBirthday + year}**`)
				.setFooter({ text: 'This server currently has this feature disabled, you will not receive a message in this server.' });
			message.channel.send({ embeds: [embed] });
			return;
		}

		if (!birthdayConfigDB) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Birthday**`,
					`**◎ Error:** Birthdays are currently disabled on this server, an admin may need to enable this function.\nThey can do this by running \`${prefix}config birthday\``);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (user.id !== message.author.id && !birthdayDB) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Birthday**`,
					`**◎** ${user} does not have a birthday set!`);
			message.channel.send({ embeds: [embed] });
			return;
		}

		if (args[0] === undefined && !birthdayDB) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Birthday**`,
					`**◎ Error:** Incorrect usage! You have 3 commands you can run.\n\n\`${prefix}birthday <MM/DD/YYYY>\` - Sets your birthday\n\`${prefix}birthday -r <MM/DD/YYYY>\` - Changes your birthday\n\`${prefix}birthday -d\` - Deletes your birthday`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (user.id !== message.author.id) {
			if (birthdayDB) {
				let year;

				const bdayNow = moment();
				const nextBirthday = birthdayDB.birthday.slice(0, birthdayDB.birthday.length - 4);

				const birthdayNext = new Date(nextBirthday + bdayNow.year());
				const getNow = new Date();
				if (birthdayNext > getNow) {
					year = bdayNow.year();
				} else {
					year = bdayNow.year() + 1;
				}

				const then = moment(nextBirthday + year);

				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Birthday**`,
						`**◎** ${user}'s **next** birthday is in **${ms(then - bdayNow, { long: true })}**, on **${nextBirthday + year}**`);
				message.channel.send({ embeds: [embed] });
				return;
			}
		}

		if (args[0] === 'help') {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Birthday**`,
					`**◎ Error:** Incorrect usage! You have 3 commands you can run.\n\n\`${prefix}birthday <MM/DD/YYYY>\` - Sets your birthday\n\`${prefix}birthday -r <MM/DD/YYYY>\` - Changes your birthday\n\`${prefix}birthday -d\` - Deletes your birthday`);
			message.channel.send({ embeds: [embed] });
			return;
		}

		if (args[0] === '-d') {
			if (!birthdayDB) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Birthday**`,
						`**◎ Error:** I could not find your birthday in the database!`);
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			await db.prepare('DELETE FROM birthdays WHERE userid = ?').run(message.author.id);

			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Birthday**`,
					`**◎ Success:** I have removed your birthday from the database!`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (args[0] === '-r') {
			if (!birthdayDB) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Birthday**`,
						`**◎ Error:** I could not find your birthday in the database!`);
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			if (!args[1]) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Birthday**`,
						`**◎ Error:** Incorrect usage, an example of this command would be:\n\`${prefix}birthday -r 11/04/2018\``);
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			const validateDate = moment(args[1], 'MM/DD/YYYY', true).isValid();

			if (!validateDate) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Birthday**`,
						`**◎ Error:** Please input a valid date! Input should be \`MM/DD/YYYY\`\nAn example would be:\n\`11/04/2018\``);
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			const birthdayUpd = new Date(args[1]);
			const now = new Date();

			if (birthdayUpd > now) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Birthday**`,
						`**◎ Error:** You tried to set your birthday to: \`${args[1]}\` ... that date is in the future <:wut:745408596233289839>`);
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Birthday**`,
					`**◎ Success:** You have successfully set your birthday to \`${args[1]}\``);
			message.channel.send({ embeds: [embed] });

			await db.prepare('UPDATE birthdays SET birthday = (@birthday), lastRun = (@lastRun) WHERE userid = (@userid);').run({
				userid: message.author.id,
				birthday: args[1],
				lastRun: null
			});
			return;
		}

		if (birthdayDB) {
			let year;

			const bdayNow = moment();
			const nextBirthday = birthdayDB.birthday.slice(0, birthdayDB.birthday.length - 4);

			const birthdayNext = new Date(nextBirthday + bdayNow.year());
			const getNow = new Date();
			if (birthdayNext > getNow) {
				year = bdayNow.year();
			} else {
				year = bdayNow.year() + 1;
			}

			const then = moment(nextBirthday + year, 'MM/DD/YYYY');

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Birthday**`,
					`**◎** ${user}'s **next** birthday is in **${ms(then - bdayNow, { long: true })}**, on **${nextBirthday + year}**`)
				.setFooter({ text: `Run '${prefix}birthday help' if you wish to change your birthday` });
			message.channel.send({ embeds: [embed] });
			return;
		}

		if (args[0] === undefined && !birthdayDB) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Birthday**`,
					`**◎ Error:** Incorrect usage! You have 3 commands you can run.\n\n\`${prefix}birthday <MM/DD/YYYY>\` - Sets your birthday\n\`${prefix}birthday -r <MM/DD/YYYY>\` - Changes your birthday\n\`${prefix}birthday -d\` - Deletes your birthday`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const birthdayUpd = new Date(args[0]);
		const now = new Date();

		if (birthdayUpd > now) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Birthday**`,
					`**◎ Error:** You tried to set your birthday to: \`${args[0]}\` ... that date is in the future <:wut:745408596233289839>`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const validateDate = moment(args[0], 'MM/DD/YYYY', true).isValid();

		if (!validateDate) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Birthday**`,
					`**◎ Error:** Please input a valid date! Input should be \`MM/DD/YYYY\`\nAn example would be:\n\`11/04/2018\``);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const insert = db.prepare('INSERT INTO birthdays (userid, birthday, lastRun) VALUES (@userid, @birthday, @lastRun);');
		insert.run({
			userid: message.author.id,
			birthday: args[0],
			lastRun: null
		});

		const embed = new MessageEmbed()
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Birthday**`,
				`**◎ Success:** You have successfully set your birthday to \`${args[0]}\``);
		message.channel.send({ embeds: [embed] });
	}

};
