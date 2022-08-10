const Command = require('../../Structures/Command');
const { EmbedBuilder, MessageButton, MessageActionRow } = require('discord.js');
const comCooldown = new Set();
const comCooldownSeconds = 10;
const RedditImageFetcher = require('reddit-image-fetcher');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['drwho'],
			description: 'Fetches a random post from r/DoctorWhumour.',
			category: 'Fun'
		});
	}

	async run(message) {
		if (comCooldown.has(message.author.id)) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Doctor Who**`,
					`**◎ Error:** Please only run this command once.`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const msg = await message.channel.send({ content: 'Generating...' });
		message.channel.sendTyping();

		async function getMeme() {
			return RedditImageFetcher.fetch({
				type: 'custom',
				total: 1,
				subreddit: ['DoctorWhumour']
			});
		}

		const meme = await getMeme();

		const embed = new EmbedBuilder()
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.setAuthor({ name: `${meme[0].title.length >= 256 ? `${meme[0].title.substring(0, 253)}...` : meme[0].title}`, url: `${meme[0].postLink}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
			.setImage(meme[0].image)
			.setFooter({ text: `👍 ${meme[0].upvotes}` });

		const buttonA = new MessageButton()
			.setStyle('PRIMARY')
			.setLabel('Next Post')
			.setCustomId('nxtmeme');

		const row = new MessageActionRow()
			.addComponents(buttonA);

		const m = await message.channel.send({ components: [row], embeds: [embed] });

		const filter = (but) => but.user.id !== this.client.user.id;

		const collector = m.createMessageComponentCollector({ filter: filter, time: 15000 });

		const newMemes = await getNewMeme();

		if (!comCooldown.has(message.author.id)) {
			comCooldown.add(message.author.id);
		}
		setTimeout(() => {
			if (comCooldown.has(message.author.id)) {
				comCooldown.delete(message.author.id);
			}
		}, comCooldownSeconds * 1000);

		collector.on('collect', async b => {
			if (b.user.id !== message.author.id) {
				const wrongUser = new EmbedBuilder()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Doctor Who**`,
						`**◎ Error:** Only the command executor can select an option!`);
				b.reply({ embeds: [wrongUser], ephemeral: true });
				return;
			}

			collector.resetTimer();

			if (b.customId === 'nxtmeme') {
				// Pick a random meme
				const randomMeme = newMemes[Math.floor(Math.random() * newMemes.length)];

				// Remove the used meme from the list
				newMemes.splice(newMemes.indexOf(randomMeme), 1);

				// If there are no more memes, remove the button
				if (newMemes.length === 0) {
					const newMeme = new EmbedBuilder()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.setAuthor({ name: `${randomMeme.title.length >= 256 ? `${randomMeme.title.substring(0, 253)}...` : randomMeme.title}`, url: `${randomMeme.postLink}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
						.setImage(randomMeme.image)
						.setFooter({ text: `👍 ${randomMeme.upvotes}` });
					await b.update({ embeds: [newMeme], components: [] });
					return;
				}

				const newMeme = new EmbedBuilder()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.setAuthor({ name: `${randomMeme.title.length >= 256 ? `${randomMeme.title.substring(0, 253)}...` : randomMeme.title}`, url: `${randomMeme.postLink}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
					.setImage(randomMeme.image)
					.setFooter({ text: `👍 ${randomMeme.upvotes}` });
				await b.update({ embeds: [newMeme], components: [row] });
			}
		});

		collector.on('end', () => {
			// Disable button and update message
			buttonA.setDisabled(true);
			m.edit({ components: [row] });

			if (comCooldown.has(message.author.id)) {
				comCooldown.delete(message.author.id);
			}
		});

		this.client.utils.deletableCheck(msg, 0);

		async function getNewMeme() {
			return RedditImageFetcher.fetch({
				type: 'custom',
				total: 25,
				subreddit: ['DoctorWhumour']
			});
		}
	}

};
