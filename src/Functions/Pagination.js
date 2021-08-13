const { MessageButton, MessageActionRow } = require('discord.js');

module.exports = class pagination {

	constructor(client) {
		this.client = client;
	}

	async pagination(message, embeds, emojiNext, emojiHome, emojiBack) {
		const back = new MessageButton()
			.setCustomId('back')
			.setEmoji(emojiBack || '◀️')
			.setStyle('PRIMARY')
			.setDisabled(true);

		const home = new MessageButton()
			.setCustomId('home')
			.setEmoji(emojiHome || '🏠')
			.setStyle('PRIMARY')
			.setDisabled(true);

		const next = new MessageButton()
			.setCustomId('next')
			.setEmoji(emojiNext || '▶️')
			.setStyle('PRIMARY');

		const row = new MessageActionRow()
			.addComponents(back, home, next);

		const m = await message.channel.send({ embeds: [embeds[0]], components: [row] });

		const filter = i => i.user.id === message.author.id;

		const collector = m.createMessageComponentInteractionCollector(filter, { time: 30000 });

		let currentPage = 0;

		collector.on('collect', async b => {
			collector.resetTimer();

			if (b.customID === 'back') {
				if (currentPage !== 0) {
					if (currentPage === embeds.length - 1) {
						next.setDisabled(false);
					}

					--currentPage;

					if (currentPage === 0) {
						back.setDisabled(true);
						home.setDisabled(true);
					}

					const rowNew = new MessageActionRow()
						.addComponents(back, home, next);

					await b.update({ embeds: [embeds[currentPage]], components: [rowNew] });
				}
			}

			if (b.customID === 'next') {
				if (currentPage < embeds.length - 1) {
					currentPage++;

					if (currentPage === embeds.length - 1) {
						next.setDisabled(true);
					}

					home.setDisabled(false);
					back.setDisabled(false);

					const rowNew = new MessageActionRow()
						.addComponents(back, home, next);

					await b.update({ embeds: [embeds[currentPage]], components: [rowNew] });
				}
			}

			if (b.customID === 'home') {
				currentPage = 0;
				home.setDisabled(true);
				back.setDisabled(true);
				next.setDisabled(false);

				const rowNew = new MessageActionRow()
					.addComponents(back, home, next);

				await b.update({ embeds: [embeds[currentPage]], components: [rowNew] });
			}
		});

		collector.on('end', () => {
			if (m && m.deletable) {
				m.delete();
			}
		});

		collector.on('error', (e) => console.log(e));
	}

};
