const Event = require('../Structures/Event');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	async run(message) {
		async function linkTag(grabClient) {
			const mainReg = /https:\/\/discordapp\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,18}/;
			const ptbReg = /https:\/\/ptb\.discordapp\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,18}/;
			const mainCheck = mainReg.test(message.content.toLowerCase());
			const ptbCheck = ptbReg.test(message.content.toLowerCase());
			const exec = mainReg.exec(message.content.toLowerCase()) || ptbReg.exec(message.content.toLowerCase());

			let guildID;
			let channelID;
			let messageID;

			if (mainCheck || ptbCheck) {
				const mainGlob = /https:\/\/discordapp\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,18}/g;
				const ptbGlob = /https:\/\/ptb\.discordapp\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,18}/g;
				let lengthMain;
				let lengthPtb;

				if (mainGlob.test(message.content.toLowerCase()) === true) {
					lengthMain = message.content.toLowerCase().match(mainGlob).length;
				} else {
					lengthMain = 0;
				}
				if (ptbGlob.test(message.content.toLowerCase()) === true) {
					lengthPtb = message.content.toLowerCase().match(ptbGlob).length;
				} else {
					lengthPtb = 0;
				}

				if (lengthMain + lengthPtb > 1) return;

				const mesLink = exec[0];
				if (mainCheck) {
					guildID = mesLink.substring(32, mesLink.length - 38);
					channelID = mesLink.substring(51, mesLink.length - 19);
					messageID = mesLink.substring(70);
				} else if (ptbCheck) {
					guildID = mesLink.substring(36, mesLink.length - 38);
					channelID = mesLink.substring(55, mesLink.length - 19);
					messageID = mesLink.substring(74);
				}
				if (!guildID) {
					return;
				}
				if (!channelID) {
					return;
				}
				if (!messageID) {
					return;
				}
				const embed = new MessageEmbed()
					.setAuthor(`${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
					.setColor(message.guild.me.displayHexColor || '36393F')
					.setFooter(`Req. by ${message.author.username}`)
					.setTimestamp();
				if (message.guild.id === guildID) {
					const findGuild = grabClient.guilds.cache.get(guildID);
					const findChannel = findGuild.channels.cache.get(channelID);
					const validExtensions = ['gif', 'png', 'jpeg', 'jpg'];

					await findChannel.messages.fetch(messageID).then((res) => {
						if (res) {
							if (res.embeds[0]) { // fail bruh
								if (res.embeds[0].url) {
									const fileExtension = res.embeds[0].url.substring(res.embeds[0].url.lastIndexOf('.') + 1);
									if (validExtensions.includes(fileExtension)) {
										embed.setDescription(`**[Message Link](${message.content}) to** ${res.channel}\n${res.content}`);
										embed.setImage(res.embeds[0].url);
										message.channel.send(embed);
									}
									return;
								} else {
									return;
								}
							}

							const attachmentCheck = res.attachments.first();
							if (attachmentCheck && res.content !== '') {
								const attachmentUrl = res.attachments.first().url;
								const fileExtension = attachmentUrl.substring(attachmentUrl.lastIndexOf('.') + 1);
								if (!validExtensions.includes(fileExtension)) {
									embed.setDescription(`**[Message Link](${message.content}) to** ${res.channel}\n${res.content}`);
									return;
								} else {
									embed.setDescription(`**[Message Link](${message.content}) to** ${res.channel}\n${res.content}`);
									embed.setImage(attachmentUrl);
									message.channel.send(embed);
									return;
								}
							}
							if (attachmentCheck) {
								const attachmentUrl = res.attachments.first().url;
								const fileExtension = attachmentUrl.substring(attachmentUrl.lastIndexOf('.') + 1);
								if (!validExtensions.includes(fileExtension)) {
									return;
								} else {
									embed.setDescription(`**[Message Link](${message.content}) to** ${res.channel}`);
									embed.setImage(attachmentUrl);
									message.channel.send(embed);
									return;
								}
							} else {
								embed.setDescription(`**[Message Link](${message.content}) to** ${res.channel}\n${res.content}`);
								message.channel.send(embed);
								return;
							}
						}
					}).catch((e) => {
						console.log(e);
					});
				}
			}
		}
		linkTag(this.client);


		if (this.client.filterList.some(word => message.content.toLowerCase().includes(` ${word} `))) {
			message.delete();
			message.channel.send('BOI THAT"S A BLOCKED WORD!');
		}
		const mentionRegex = RegExp(`^<@!${this.client.user.id}>$`);

		if (!message.guild || message.author.bot) return;

		if (message.content.match(mentionRegex)) message.channel.send(`My prefix for ${message.guild.name} is \`${this.client.prefix}\`.`);

		const { prefix } = this.client;

		if (!message.content.startsWith(prefix)) return;

		// eslint-disable-next-line no-unused-vars
		const [cmd, ...args] = message.content.slice(prefix.length).trim().split(/ +/g);

		const command = this.client.commands.get(cmd.toLowerCase()) || this.client.commands.get(this.client.aliases.get(cmd.toLowerCase()));
		if (command) {
			command.run(message, args);
		}
	}

};
