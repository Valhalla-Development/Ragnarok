const Command = require('../../Structures/Command');
const { EmbedBuilder } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['pay'],
			description: 'Gives money to specified user from your bank.',
			category: 'Economy',
			usage: '<@user> <amount/all>'
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const user = message.mentions.users.first();

		if (!user) {
			this.client.utils.messageDelete(message, 10000);

			const wrongUsage = new EmbedBuilder()
				.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Give**`,
					`**◎ Error:** An example of this command is: \`${prefix}give @user 100\`\nAlternatively, you can run \`${prefix}give @user all\``);
			message.channel.send({ embeds: [wrongUsage] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		let balance;
		let otherB;
		if (message.guild) {
			balance = this.client.getBalance.get(`${message.author.id}-${message.guild.id}`);
			otherB = this.client.getBalance.get(`${user.id}-${message.guild.id}`);
		}

		if (args[1] === '-a') {
			if (this.client.utils.checkOwner(message.author.id)) {
				const update = db.prepare('UPDATE balance SET bank = (@bank), total = (@total) WHERE id = (@id);');
				await update.run({
					bank: otherB.bank + Number(args[2]),
					total: otherB.total + Number(args[2]),
					id: `${user.id}-${message.guild.id}`
				});

				const amt = otherB.total + Number(args[2]);
				const embed = new EmbedBuilder()
					.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Give - Admin**`,
						`**◎ Success:** System gave <:coin:706659001164628008> \`${Number(args[2]).toLocaleString('en')}\` to ${user}\nNew total: <:coin:706659001164628008> \`${amt.toLocaleString('en')}\``);
				message.channel.send({ embeds: [embed] });
				return;
			}
		}

		if (user.id === message.author.id) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new EmbedBuilder()
				.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Give**`,
					`**◎ Error:** You can not give yourself money. <:wut:745408596233289839>`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (user.bot) return;

		if (!otherB) {
			this.client.utils.messageDelete(message, 10000);

			const errorE = new EmbedBuilder()
				.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Give**`,
					`**◎ Error:** ${user} does not have an economy account. They will instantly open one when they speak.`);
			message.channel.send({ embeds: [errorE] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}


		if (balance.bank === 0) {
			this.client.utils.messageDelete(message, 10000);

			const noBal = new EmbedBuilder()
				.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Give**`,
					`**◎ Error:** Uh oh! You currently have no money in your bank!`);
			message.channel.send({ embeds: [noBal] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (args[1] === 'all') {
			this.client.utils.messageDelete(message, 10000);

			const totaCalc1 = otherB.total + balance.bank;

			otherB.bank += balance.bank;
			otherB.total = totaCalc1;
			this.client.setUserBalance.run(otherB);

			const totaCalc2 = balance.total - balance.bank;

			const depAll = new EmbedBuilder()
				.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Give**`,
					`**◎ Success:** You have paid ${user} the sum of: <:coin:706659001164628008> \`${balance.bank.toLocaleString('en')}\`.`);
			message.channel.send({ embeds: [depAll] });

			balance.bank = 0;
			balance.total = totaCalc2;
			this.client.setBalance.run(balance);
			return;
		}

		if (isNaN(args[1]) || args.length > 2) {
			this.client.utils.messageDelete(message, 10000);

			const wrongUsage = new EmbedBuilder()
				.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Give**`,
					`**◎ Error:** An example of this command is: \`${prefix}give @user 100\`\nAlternatively, you can run \`${prefix}give @user all\``);
			message.channel.send({ embeds: [wrongUsage] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (Number(args[1]) < 1) {
			this.client.utils.messageDelete(message, 10000);

			const wrongUsage = new EmbedBuilder()
				.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Give**`,
					`**◎ Error:** Please enter a value of at least \`1\`. Please try again with a valid amount.`);
			message.channel.send({ embeds: [wrongUsage] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (args[1] > balance.bank) {
			this.client.utils.messageDelete(message, 10000);

			const wrongUsage = new EmbedBuilder()
				.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Give**`,
					`**◎ Error:** You only have <:coin:706659001164628008> \`${balance.bank.toLocaleString('en')}\`. Please try again with a valid amount.`);
			message.channel.send({ embeds: [wrongUsage] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const numberCov = Number(args[1]);

		const totaCalc1 = otherB.total + numberCov;

		otherB.bank += numberCov;
		otherB.total = totaCalc1;
		this.client.setUserBalance.run(otherB);

		const totaCalc2 = balance.total - numberCov;

		balance.bank -= numberCov;
		balance.total = totaCalc2;
		this.client.setBalance.run(balance);

		const depArg = new EmbedBuilder()
			.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Give**`,
				`**◎ Success:** You have paid ${user} the sum of: <:coin:706659001164628008> \`${numberCov.toLocaleString('en')}\`.`);
		message.channel.send({ embeds: [depArg] });
	}

};
