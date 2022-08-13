const Command = require('../../Structures/Command');
const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const comCooldown = new Set();
const comCooldownSeconds = 10;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['vbucks', 'fortnite'],
			description: 'Hidden Easter Egg, shh!',
			category: 'Hidden',
			botPerms: ['AddReactions']
		});
	}

	async run(message) {
		this.client.utils.messageDelete(message, 10000);

		const buttonA = new ButtonBuilder()
			.setStyle(ButtonStyle.Success)
			.setLabel('Yes!')
			.setCustomId('yes');

		const buttonB = new ButtonBuilder()
			.setStyle(ButtonStyle.Danger)
			.setLabel('No!')
			.setCustomId('no');

		const row = new ActionRowBuilder()
			.addComponents(buttonA, buttonB);

		const buttonANew = new ButtonBuilder()
			.setStyle(ButtonStyle.Success)
			.setLabel('Yes!')
			.setCustomId('yes')
			.setDisabled(true);

		const buttonBNew = new ButtonBuilder()
			.setStyle(ButtonStyle.Danger)
			.setLabel('No!')
			.setCustomId('no')
			.setDisabled(true);

		const rowNew = new ActionRowBuilder()
			.addComponents(buttonANew, buttonBNew);

		const embed = new EmbedBuilder()
			.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
			.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
			.addFields({ name: `**${this.client.user.username} - Free V-Bucks**`,
				value: `**◎ Success:** ${message.author}, Would you like to claim your **FREE** V-Bucks?` });

		const embedNew = new EmbedBuilder()
			.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
			.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
			.addFields({ name: `**${this.client.user.username} - Free V-Bucks**`,
				value: `**◎ Success:** ${message.author}, Virus activated!.` });

		const m = await message.channel.send({ embeds: [embed], components: [row] });
		const filter = (but) => but.user.id === message.author.id;

		const collector = m.createMessageComponentCollector({ filter: filter, time: 15000 });

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
