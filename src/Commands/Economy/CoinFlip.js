/* eslint-disable prefer-destructuring */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-mixed-operators */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const { MessageButton, MessageActionRow } = require('discord-buttons');
const comCooldown = new Set();
const comCooldownSeconds = 10;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['cf'],
			description: 'Flip a coin!',
			category: 'Economy'
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const balance = this.client.getBalance.get(`${message.author.id}-${message.guild.id}`);

		if (!balance) {
			this.client.utils.messageDelete(message, 10000);

			const limitE = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Coin Flip**`,
					`**◎ Error:** You do not have any balance!`);
			message.channel.send(limitE).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (!args[0]) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Coin Flip**`,
					`**◎ Error:** Please input an amount you wish to bet.`);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (comCooldown.has(message.author.id)) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Coin Flip**`,
					`**◎ Error:** You can only run one instance of this game!.`);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		let coinFlip;

		isNaN(args[0]) && args[0] === 'all' ? coinFlip = balance.bank : coinFlip = args[0];

		if (isNaN(coinFlip)) {
			this.client.utils.messageDelete(message, 10000);

			const wrongUsage = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Coin Flip**`,
					`**◎ Error:** An example of this command is: \`${prefix}coinflip 100\`\nAlternatively, you can run \`${prefix}coinflip all\``);
			message.channel.send(wrongUsage).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (Number(coinFlip) < 10) {
			this.client.utils.messageDelete(message, 10000);

			const wrongUsage = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Coin Flip**`,
					`**◎ Error:** Please enter a value of at least <:coin:706659001164628008> \`10\`. Please try again with a valid amount.`);
			message.channel.send(wrongUsage).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (Number(coinFlip) > balance.bank) {
			this.client.utils.messageDelete(message, 10000);

			const wrongUsage = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Coin Flip**`,
					`**◎ Error:** You do not have enough to bet <:coin:706659001164628008> \`${Number(coinFlip).toLocaleString('en')}\`, you have <:coin:706659001164628008> \`${Number(balance.bank).toLocaleString('en')}\` available in your bank.`);
			message.channel.send(wrongUsage).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const flip = ['heads', 'tails'];
		const answer = flip[Math.floor(Math.random() * flip.length)];
		const houseBet = coinFlip;
		const winAmt = Number(coinFlip) + Number(houseBet);

		const buttonA = new MessageButton()
			.setStyle('blurple')
			.setLabel('Heads!')
			.setID('heads');

		const buttonB = new MessageButton()
			.setStyle('blurple')
			.setLabel('Tails!')
			.setID('tails');

		const buttonC = new MessageButton()
			.setStyle('red')
			.setLabel('Cancel')
			.setID('cancel');

		const row = new MessageActionRow()
			.addComponent(buttonA)
			.addComponent(buttonB)
			.addComponent(buttonC);

		const buttonANew = new MessageButton()
			.setStyle('blurple')
			.setLabel('Heads!')
			.setID('heads')
			.setDisabled();

		const buttonBNew = new MessageButton()
			.setStyle('blurple')
			.setLabel('Tails!')
			.setID('tails')
			.setDisabled();

		const buttonCNew = new MessageButton()
			.setStyle('red')
			.setLabel('Cancel')
			.setID('cancel')
			.setDisabled();

		const rowNew = new MessageActionRow()
			.addComponent(buttonANew)
			.addComponent(buttonBNew)
			.addComponent(buttonCNew);

		const initial = new MessageEmbed()
			.setAuthor(`${message.author.tag}`, message.author.avatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Coin Flip**`,
				`**◎** ${message.author} bet <:coin:706659001164628008> \`${Number(coinFlip).toLocaleString('en')}\`\n**◎** The house bet <:coin:706659001164628008> \`${Number(houseBet).toLocaleString('en')}\``);

		const win = new MessageEmbed()
			.setAuthor(`${message.author.tag}`, message.author.avatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Coin Flip**`,
				`**◎** ${message.author} won! <:coin:706659001164628008> \`${winAmt.toLocaleString('en')}\` has been credited to your bank!`);

		const lose = new MessageEmbed()
			.setAuthor(`${message.author.tag}`, message.author.avatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Coin Flip**`,
				`**◎** ${message.author} lost <:coin:706659001164628008> \`${coinFlip.toLocaleString('en')}\``);

		const m = await message.channel.send({ component: row, embed: initial });
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
			if (b.id === 'heads') {
				if (answer === 'heads') {
					m.edit({ component: rowNew, embed: win });
					balance.bank += winAmt;
					balance.total += winAmt;
					this.client.setBalance.run(balance);
					collector.stop('win');
					return;
				}
				m.edit({ component: rowNew, embed: lose });
				balance.bank -= coinFlip;
				balance.total -= coinFlip;
				this.client.setBalance.run(balance);
				collector.stop('lose');
				return;
			} else if (b.id === 'tails') {
				if (answer === 'tails') {
					m.edit({ component: rowNew, embed: win });
					balance.bank += winAmt;
					balance.total += winAmt;
					this.client.setBalance.run(balance);
					collector.stop('win');
					return;
				}
				m.edit({ component: rowNew, embed: lose });
				balance.bank -= coinFlip;
				balance.total -= coinFlip;
				this.client.setBalance.run(balance);
				collector.stop('lose');
				return;
			}
			if (b.id === 'cancel') {
				collector.stop('cancel');
			}
		});
		collector.on('end', (_, reason) => {
			if (comCooldown.has(message.author.id)) {
				comCooldown.delete(message.author.id);
			}

			if (reason === 'cancel' || reason === 'time') {
				this.client.utils.messageDelete(message, 0);
				this.client.utils.messageDelete(m, 0);

				const limitE = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Coin Flip**`,
						`**◎ Success:** Your bet was cancelled, your money has been returned.`);
				message.channel.send(limitE).then((ca) => this.client.utils.deletableCheck(ca, 10000));
				return;
			}
		});
	}

};
