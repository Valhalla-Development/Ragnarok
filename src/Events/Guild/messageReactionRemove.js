/* eslint-disable no-useless-escape */
const Event = require('../../Structures/Event');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Event {

	async run(messageReaction, user) {
		const { message } = messageReaction;

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

		const fetchedMessages = await starChannel.messages.fetch({ limit: 100 });

		// Check if the reaction was in the starboard channel
		if (message.channel.id === starChannel.id) {
			if (user.id !== this.client.user.id) {
				if (message.embeds[0].footer.text.startsWith('⭐')) {
					const foundStar = message.embeds[0];
					// Do some magic to get the fotter message id
					const getThatID = foundStar.footer.text;
					// Split that sum-bitch
					const dataArray = getThatID.split('|');
					const star = /^\⭐\s([0-9]{1,3})\s\|\s([0-9]{17,20})/.exec(foundStar.footer.text);
					// We use the this.extension function to see if there is anything attached to the message.
					const image = message.attachments.size > 0 ? await this.extension(messageReaction, message.attachments.array()[0].url) : '';
					const embed = new MessageEmbed()
						.setColor(foundStar.color)
						.setThumbnail(foundStar.thumbnail.url)
						.addFields(foundStar.fields)
						.setTimestamp()
						.setFooter({ text: `⭐ ${parseInt(star[1]) - 1} |${dataArray[1]}` })
						.setImage(image);
					// We fetch the ID of the message already on the starboard.
					const starMsg = await starChannel.messages.fetch(message.id);
					// And now we edit the message with the new embed!
					await starMsg.edit({ embeds: [embed] });
					if (parseInt(star[1]) - 1 === 0) {
						this.client.utils.messageDelete(starMsg, 1000);
						return;
					}
				}
			} else {
				return;
			}
			return;
		}

		// Filter only messages with an embed
		const filtered = fetchedMessages.filter(m => m.embeds.length > 0);

		// We check the messages within the fetch object to see if the message that was reacted to is already a message in the starboard
		const stars = filtered.find(m => m.embeds[0].footer.text.startsWith('⭐') && m.embeds[0].footer.text.endsWith(message.id));

		if (stars) {
			const star = /^\⭐\s([0-9]{1,3})\s\|\s([0-9]{17,20})/.exec(stars.embeds[0].footer.text);
			const foundStar = stars.embeds[0];
			// Do some magic to get the fotter message id
			const getThatID = foundStar.footer.text;
			// Split that sum-bitch
			const dataArray = getThatID.split('|');
			const image = message.attachments.size > 0 ? await this.extension(messageReaction, message.attachments.array()[0].url) : '';
			const embed = new MessageEmbed()
				.setColor(foundStar.color)
				.setThumbnail(foundStar.thumbnail.url)
				.addFields(foundStar.fields)
				.setTimestamp()
				.setFooter({ text: `⭐ ${parseInt(star[1]) - 1} |${dataArray[1]}` })
				.setImage(image);
			const starMsg = await starChannel.messages.fetch(stars.id);
			await starMsg.edit({ embeds: [embed] });
			if (parseInt(star[1]) - 1 === 0) {
				this.client.utils.messageDelete(starMsg, 1000);
				return;
			}
		}
	}

	// Now, it may seem weird that we use this in the messageReactionRemove event, but we still need to check if there's an image so that we can set it, if necessary.
	extension(reaction, attachment) {
		const imageLink = attachment.split('.');
		const typeOfImage = imageLink[imageLink.length - 1];
		const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
		if (!image) return '';
		return attachment;
	}

};
