const Command = require('../../Structures/Command');
const { MessageButton, MessageActionRow } = require('discord-buttons');
const { MessageEmbed } = require('discord.js');
const comCooldown = new Set();
const comCooldownSeconds = 20;

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
			.setStyle('green')
			.setLabel('Yes!')
			.setID('yes');

		const buttonB = new MessageButton()
			.setStyle('red')
			.setLabel('No!')
			.setID('no');

		const row = new MessageActionRow()
			.addComponent(buttonA)
			.addComponent(buttonB);

		const buttonANew = new MessageButton()
			.setStyle('green')
			.setLabel('Yes!')
			.setID('yes')
			.setDisabled();

		const buttonBNew = new MessageButton()
			.setStyle('red')
			.setLabel('No!')
			.setID('no')
			.setDisabled();

		const rowNew = new MessageActionRow()
			.addComponent(buttonANew)
			.addComponent(buttonBNew);

		const embed = new MessageEmbed()
			.setAuthor(`${message.author.tag}`, message.author.avatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Free V-Bucks**`,
				`**◎ Success:** Would you like to claim your **FREE* V-Bucks?`);

		const embedNew = new MessageEmbed()
			.setAuthor(`${message.author.tag}`, message.author.avatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Free V-Bucks**`,
				`**◎ Success:** Virus activated!.`);

		const m = await message.channel.send({ embed: embed, component: row });
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
			if (b.id === 'yes') {
				m.edit({ component: rowNew, embed: embedNew });
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
