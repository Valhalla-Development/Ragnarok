const Command = require('../../Structures/Command');
const { MessageButton, MessageActionRow } = require('discord.js');
const { MessageEmbed } = require('discord.js');
const comCooldown = new Set();
const comCooldownSeconds = 10;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['vbucks', 'fortnite'],
			description: 'Hidden Easter Egg, shh!',
			category: 'Hidden',
			botPerms: ['ADD_REACTIONS']
		});
	}

	async run(message) {
		this.client.utils.messageDelete(message, 10000);

		const buttonA = new MessageButton()
			.setStyle('SUCCESS')
			.setLabel('Yes!')
			.setcustomId('yes');

		const buttonB = new MessageButton()
			.setStyle('DANGER')
			.setLabel('No!')
			.setcustomId('no');

		const row = new MessageActionRow()
			.addComponents(buttonA, buttonB);

		const buttonANew = new MessageButton()
			.setStyle('SUCCESS')
			.setLabel('Yes!')
			.setcustomId('yes')
			.setDisabled(true);

		const buttonBNew = new MessageButton()
			.setStyle('DANGER')
			.setLabel('No!')
			.setcustomId('no')
			.setDisabled(true);

		const rowNew = new MessageActionRow()
			.addComponents(buttonANew, buttonBNew);

		const embed = new MessageEmbed()
			.setAuthor(`${message.author.tag}`, message.author.avatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Free V-Bucks**`,
				`**◎ Success:** ${message.author}, Would you like to claim your **FREE** V-Bucks?`);

		const embedNew = new MessageEmbed()
			.setAuthor(`${message.author.tag}`, message.author.avatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Free V-Bucks**`,
				`**◎ Success:** ${message.author}, Virus activated!.`);

		const m = await message.channel.send({ embeds: [embed], components: [row] });
		const filter = (but) => but.user.id === message.author.id;

		const collector = m.createMessageComponentInteractionCollector(filter, { time: 10000 });

		if (!comCooldown.has(message.author.id)) {
			comCooldown.add(message.author.id);
		}
		setTimeout(() => {
			if (comCooldown.has(message.author.id)) {
				comCooldown.delete(message.author.id);
			}
		}, comCooldownSeconds * 1000);

		collector.on('collect', async b => {
			if (b.customId === 'yes') {
				b.update({ components: [rowNew], embeds: [embedNew] });
				collector.stop('yes');
				return;
			}
			collector.stop('no');
		});
		collector.on('end', (_, reason) => {
			if (comCooldown.has(message.author.id)) {
				comCooldown.delete(message.author.id);
			}

			if (reason === 'no' || reason === 'time') {
				this.client.utils.messageDelete(message, 0);
				this.client.utils.messageDelete(m, 0);
				return;
			}
		});
	}

};
