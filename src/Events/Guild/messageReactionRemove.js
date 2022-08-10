/* eslint-disable max-depth */
/* eslint-disable no-useless-escape */
const Event = require('../../Structures/Event');
const { EmbedBuilder } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Event {

	async run(messageReaction, user) {
		const grabMessage = messageReaction.message;
		const { channelId } = grabMessage;
		const msgId = grabMessage.id;

		// Fetch the channel
		const fetchChn = this.client.channels.cache.get(channelId);
		if (!fetchChn) return;

		// Fetch the message
		const message = await fetchChn.messages.fetch(msgId);
		if (!message) return;

		// Starboard check
		const id = db.prepare(`SELECT channel FROM starboard WHERE guildid = ${message.guild.id};`).get();
		if (!id) return;

		const chn = id.channel;
		if (!chn) return;

		if (id.channel === null) {
			db.prepare(`DELETE FROM starboard WHERE guildid = ${message.guild.id}`).run();
			return;
		}

		if (!message.guild.channels.cache.find(channel => channel.id === id.channel)) {
			db.prepare(`DELETE FROM starboard WHERE guildid = ${message.guild.id}`).run();
			return;
		}

		const starChannel = message.guild.channels.cache.find(channel => channel.id === id.channel);

		// Check if bot has perms to send messages in starboard channel
		if (!message.guild.me.permissionsIn(starChannel).has('SEND_MESSAGES')) return;

		if (messageReaction.emoji.name !== '⭐') return;

		const fetchedMessages = await starChannel.messages.fetch({ limit: 10 });

		// Check if the reaction was in the starboard channel
		if (message.channel.id === starChannel.id) {
			if (user.id !== this.client.user.id) {
				if (message && message.embeds[0]) {
					if (message.embeds[0].footer.text.startsWith('⭐')) {
						// We fetch the ID of the message already on the starboard.
						const starMsg = await starChannel.messages.fetch(message.id);
						if (!starMsg) return;

						const foundStar = message.embeds[0];
						// Do some magic to get the fotter message id
						const getThatID = foundStar.footer.text;
						// Split that sum-bitch
						const dataArray = getThatID.split('|');
						const star = /^\⭐\s([0-9]{1,3})\s\|\s([0-9]{17,20})/.exec(foundStar.footer.text);
						const image = foundStar.image ? foundStar.image.url : '';
						const embed = new EmbedBuilder()
							.setColor(foundStar.color)
							.setThumbnail(foundStar.thumbnail.url)
							.addFields(foundStar.fields)
							.setTimestamp()
							.setFooter({ text: `⭐ ${parseInt(star[1]) - 1} |${dataArray[1]}` })
							.setImage(image);
						// And now we edit the message with the new embed!
						await starMsg.edit({ embeds: [embed] });
						if (parseInt(star[1]) - 1 === 0) {
							this.client.utils.messageDelete(starMsg, 0);
							return;
						}
					}
				}
			} else {
				return;
			}
			return;
		}

		if (message.channel.id !== starChannel.id) {
			if (message.author.id === user.id) return;
		}

		// Filter only messages with an embed
		const filtered = fetchedMessages.filter(m => m.embeds.length > 0);

		// We check the messages within the fetch object to see if the message that was reacted to is already a message in the starboard
		const stars = filtered.find(m => m.embeds[0].footer.text.startsWith('⭐') && m.embeds[0].footer.text.endsWith(message.id));
		if (stars) {
			// We fetch the ID of the message already on the starboard.
			const starMsg = await starChannel.messages.fetch(stars.id);
			if (!starMsg) return;

			const star = /^\⭐\s([0-9]{1,3})\s\|\s([0-9]{17,20})/.exec(stars.embeds[0].footer.text);
			const foundStar = stars.embeds[0];
			const image = foundStar.image ? foundStar.image.url : '';
			// Do some magic to get the fotter message id
			const getThatID = foundStar.footer.text;
			// Split that sum-bitch
			const dataArray = getThatID.split('|');
			const embed = new EmbedBuilder()
				.setColor(foundStar.color)
				.setThumbnail(foundStar.thumbnail.url)
				.addFields(foundStar.fields)
				.setTimestamp()
				.setFooter({ text: `⭐ ${parseInt(star[1]) - 1} |${dataArray[1]}` })
				.setImage(image);
			await starMsg.edit({ embeds: [embed] });
			if (parseInt(star[1]) - 1 === 0) {
				this.client.utils.messageDelete(starMsg, 0);
				return;
			}
		}
	}

};
