const Command = require('../../Structures/Command');
const { EmbedBuilder, MessageButton, MessageActionRow } = require('discord.js');
const { supportGuild, suggestChan } = require('../../../config.json');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['suggest'],
			description: 'Sends suggestions to support server.',
			category: 'Informative',
			usage: '<text>'
		});
	}

	async run(message, args) {
		if (!args[0]) {
			this.client.utils.messageDelete(message, 10000);

			const noinEmbed = new EmbedBuilder()
				.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Suggest**`,
					`**◎ Error:** Please input some text!`);
			message.channel.send({ embeds: [noinEmbed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const argresult = args.join(' ');

		const buttonA = new MessageButton()
			.setStyle('PRIMARY')
			.setLabel('Yes')
			.setCustomId('yes');

		const buttonB = new MessageButton()
			.setStyle('DANGER')
			.setLabel('No')
			.setCustomId('no');

		const row = new MessageActionRow()
			.addComponents(buttonA, buttonB);

		const questionE = new EmbedBuilder()
			.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Suggest**`,
				`**◎ NOTE** This is a **BOT** suggestion, not a **SERVER** suggestion.\nThis message will be forwarded to the bot owner.\n\n**◎ Are you sure you want to send this suggestion?**`);

		const m = await message.channel.send({ components: [row], embeds: [questionE] });

		const filter = (but) => but.user.id !== this.client.user.id;

		const collector = m.createMessageComponentCollector({ filter: filter, time: 15000 });

		collector.on('collect', async b => {
			if (b.user.id !== message.author.id) {
				const wrongUser = new EmbedBuilder()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Help**`,
						`**◎ Error:** Only the command executor can select an option!`);
				b.reply({ embeds: [wrongUser], ephemeral: true });
				return;
			}

			collector.resetTimer();

			if (b.customId === 'yes') {
				const embed = new EmbedBuilder()
					.setColor(this.client.utils.color(this.client.guilds.cache.get(supportGuild).me.displayHexColor))
					.setTitle('Suggestion')
					.setDescription(`**◎ User: <@${message.author.id}> - **\`${message.author.tag}\`\n**Suggestion:** ${argresult}`)
					.setFooter({ text: `${message.guild.name} - ${message.guild.id}` });
				this.client.guilds.cache.get(supportGuild).channels.cache.get(suggestChan).send({ embeds: [embed] });

				this.client.utils.messageDelete(message, 10000);
				this.client.utils.messageDelete(m, 0);

				const loggedEmbed = new EmbedBuilder()
					.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Suggest**`,
						`**◎ Success:** Suggestion has been successfully sent!`);
				message.channel.send({ embeds: [loggedEmbed] }).then((a) => this.client.utils.deletableCheck(a, 10000));
			}
			if (b.customId === 'no') {
				this.client.utils.messageDelete(m, 0);
				this.client.utils.messageDelete(message, 0);
			}
		});

		collector.on('end', (_, reason) => {
			if (reason === 'time') {
				this.client.utils.messageDelete(m, 0);
				return;
			}
		});
	}

};
