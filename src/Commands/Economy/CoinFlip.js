/* eslint-disable prefer-destructuring */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-mixed-operators */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const { MessageButton, MessageActionRow } = require('discord.js');
const comCooldown = new Set();
const comCooldownSeconds = 20;

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
			message.channel.send({ embeds: [limitE] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (!args[0]) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Coin Flip**`,
					`**◎ Error:** Please input an amount you wish to bet.`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (comCooldown.has(message.author.id)) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Coin Flip**`,
					`**◎ Error:** You can only run one instance of this game!.`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
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
			message.channel.send({ embeds: [wrongUsage] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (Number(coinFlip) < 10) {
			this.client.utils.messageDelete(message, 10000);

			const wrongUsage = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Coin Flip**`,
					`**◎ Error:** Please enter a value of at least <:coin:706659001164628008> \`10\`. Please try again with a valid amount.`);
			message.channel.send({ embeds: [wrongUsage] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (Number(coinFlip) > balance.bank) {
			this.client.utils.messageDelete(message, 10000);

			const wrongUsage = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Coin Flip**`,
					`**◎ Error:** You do not have enough to bet <:coin:706659001164628008> \`${Number(coinFlip).toLocaleString('en')}\`, you have <:coin:706659001164628008> \`${Number(balance.bank).toLocaleString('en')}\` available in your bank.`);
			message.channel.send({ embeds: [wrongUsage] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const flip = ['heads', 'tails'];
		const answer = flip[Math.floor(Math.random() * flip.length)];
		const houseBet = coinFlip;

		const buttonA = new MessageButton()
			.setStyle('PRIMARY')
			.setLabel('Heads!')
			.setCustomID('heads');

		const buttonB = new MessageButton()
			.setStyle('PRIMARY')
			.setLabel('Tails!')
			.setCustomID('tails');

		const buttonC = new MessageButton()
			.setStyle('DANGER')
			.setLabel('Cancel')
			.setCustomID('cancel');

		const row = new MessageActionRow()
			.addComponents(buttonA, buttonB, buttonC);

		const buttonANew = new MessageButton()
			.setStyle('PRIMARY')
			.setLabel('Heads!')
			.setCustomID('heads')
			.setDisabled(true);

		const buttonBNew = new MessageButton()
			.setStyle('PRIMARY')
			.setLabel('Tails!')
			.setCustomID('tails')
			.setDisabled(true);

		const buttonCNew = new MessageButton()
			.setStyle('DANGER')
			.setLabel('Cancel')
			.setCustomID('cancel')
			.setDisabled(true);

		const rowNew = new MessageActionRow()
			.addComponents(buttonANew, buttonBNew, buttonCNew);

		const initial = new MessageEmbed()
			.setAuthor(`${message.author.tag}`, message.author.avatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Coin Flip**`,
				`**◎** ${message.author} bet <:coin:706659001164628008> \`${Number(coinFlip).toLocaleString('en')}\`\n**◎** The house bet <:coin:706659001164628008> \`${Number(houseBet).toLocaleString('en')}\``);

		const win = new MessageEmbed()
			.setAuthor(`${message.author.tag}`, message.author.avatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Coin Flip**`,
				`**◎** ${message.author} won! <:coin:706659001164628008> \`${houseBet.toLocaleString('en')}\` has been credited to your bank!`);

		const lose = new MessageEmbed()
			.setAuthor(`${message.author.tag}`, message.author.avatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Coin Flip**`,
				`**◎** ${message.author} lost <:coin:706659001164628008> \`${coinFlip.toLocaleString('en')}\``);

		const m = await message.channel.send({ components: [row], embeds: [initial] });
		const filter = (but) => but.user.id === message.author.id;

		const collector = m.createMessageComponentInteractionCollector(filter, { time: 20000 });

		if (!comCooldown.has(message.author.id)) {
			comCooldown.add(message.author.id);
		}
		setTimeout(() => {
			if (comCooldown.has(message.author.id)) {
				comCooldown.delete(message.author.id);
			}
		}, comCooldownSeconds * 1000);

		collector.on('collect', async b => {
			if (b.customID === 'heads') {
				if (answer === 'heads') {
					b.update({ components: [rowNew], embeds: [win] });
					balance.bank += houseBet;
					balance.total += houseBet;
					this.client.setBalance.run(balance);
					collector.stop('win');
					return;
				}
				b.update({ components: [rowNew], embeds: [lose] });
				balance.bank -= coinFlip;
				balance.total -= coinFlip;
				this.client.setBalance.run(balance);
				collector.stop('lose');
				return;
			} else if (b.customID === 'tails') {
				if (answer === 'tails') {
					b.update({ components: [rowNew], embeds: [win] });
					balance.bank += houseBet;
					balance.total += houseBet;
					this.client.setBalance.run(balance);
					collector.stop('win');
					return;
				}
				b.update({ components: [rowNew], embeds: [lose] });
				balance.bank -= coinFlip;
				balance.total -= coinFlip;
				this.client.setBalance.run(balance);
				collector.stop('lose');
				return;
			}
			if (b.customID === 'cancel') {
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
				message.channel.send({ embeds: [limitE] }).then((ca) => this.client.utils.deletableCheck(ca, 10000));
				return;
			}
		});
	}

};
