const Event = require('../../Structures/Event');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const { EmbedBuilder, MessageButton, MessageActionRow } = require('discord.js');
const discordTranscripts = require('discord-html-transcripts');
const fetchPkg = require('node-fetch-cjs');

module.exports = class extends Event {

	async run(modal) {
		if (modal.customId === `modal-${modal.channelId}`) {
			const fetchTick = db.prepare(`SELECT * FROM tickets`).all();
			if (!fetchTick) return;

			// Filter fetchTick where chanid === interaction.channel.id
			const ticket = fetchTick.find(t => t.chanid === modal.channelId);
			if (!ticket) return;

			const firstResponse = modal.getTextInputValue(`textinput-${modal.channelId}`);

			await modal.deferReply({ ephemeral: true });
			const embed = new EmbedBuilder()
				.setColor(this.client.utils.color(modal.guild.members.me.displayHexColor))
				.addFields({ name: `**${this.client.user.username} - Ticket**`,
					value: `Please stand-by while I gather all messages. This may take a while dependant on how many messages are in this channel.` });
			modal.followUp({ embeds: [embed] });

			// Generate random string
			const random = (length = 40) => {
				// Declare all characters
				const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

				// Pick characers randomly
				let str = '';
				for (let i = 0; i < length; i++) {
					str += chars.charAt(Math.floor(Math.random() * chars.length));
				}

				return str;
			};

			const staticFileNameGen = random();
			const staticFileName = `${modal.channel.name}-_-${staticFileNameGen}.html`;
			const { channel } = modal;

			channel.name = staticFileName;

			const fixedName = modal.channel.name.substr(0, modal.channel.name.indexOf('-_-'));

			const attachment = await discordTranscripts.createTranscript(channel, {
				limit: -1,
				returnBuffer: true,
				saveImages: true,
				fileName: staticFileName
			});
			const buffered = Buffer.from(attachment).toString();

			const authorizationSecret = 'pmzg!SD#9H8E#PzGMhe5dr&Qo5EQReLy@cqf87QB';

			const response = await fetchPkg.default('https://www.ragnarokbot.com/index.php', {
				method: 'POST',
				body: buffered,
				headers: { 'X-Auth': authorizationSecret }
			});

			const data = await response.status;

			let transLinkText;
			let openTranscript;
			let transcriptRow;

			if (data !== 200) {
				transLinkText = `\`Unavailable\``;
			} else {
				transLinkText = `[**Click Here**](https://www.ragnarokbot.com/transcripts/${staticFileName})`;
				// Transcript button
				openTranscript = new MessageButton()
					.setStyle('LINK')
					.setEmoji('<:ticketTranscript:998229979609440266>')
					.setLabel('View Transcript')
					.setURL(`https://www.ragnarokbot.com/transcripts/${staticFileName}`);

				transcriptRow = new MessageActionRow()
					.addComponents(openTranscript);
			}

			if (modal.channel) {
				channel.name = fixedName;
				modal.channel.delete();
			}

			const channelArgs = modal.channel.name.split('-');

			const deleteTicket = db.prepare(`DELETE FROM tickets WHERE guildid = ${modal.guild.id} AND ticketid = (@ticketid)`);
			deleteTicket.run({
				ticketid: channelArgs[channelArgs.length - 1]
			});

			const epoch = Math.floor(new Date().getTime() / 1000);

			const user = this.client.users.cache.find((a) => a.id === ticket.authorid);
			if (user) {
				const logEmbed = new EmbedBuilder()
					.setColor(this.client.utils.color(modal.guild.members.me.displayHexColor))
					.setAuthor({ name: 'Ticket Closed', iconURL: modal.guild.iconURL({ dynamic: true }) })
					.addFields({ name: `<:ticketId:998229977004781618> **Ticket ID**`,
						value: `\`${channelArgs[channelArgs.length - 1]}\``, inline: true },
					{ name: `<:ticketOpen:998229978267258881> **Opened By**`,
						value: `${user}`, inline: true },
					{ name: `<:ticketClose:998229974634991646> **Closed By**`,
						value: `${modal.user}`, inline: true },
					{ name: `<:ticketTranscript:998229979609440266> **Transcript**`,
						value: `${transLinkText}`, inline: true },
					{ name: `<:ticketCloseTime:998229975931048028> **Time Closed**`,
						value: `<t:${epoch}>`, inline: true },
					{ name: `\u200b`,
						value: `\u200b`, inline: true },
					{ name: `🖋️ **Reason**`,
						value: `${firstResponse}` })
					.setTimestamp();
				user.send(transcriptRow ? { components: [transcriptRow], embeds: [logEmbed] } : { embeds: [logEmbed] }).then(() => {
					// eslint-disable-next-line arrow-body-style
				}).catch(() => {
					return;
				});
			}

			const logget = db.prepare(`SELECT log FROM ticketConfig WHERE guildid = ${modal.guild.id};`).get();
			if (!logget) {
				return;
			}

			const logchan = modal.guild.channels.cache.find((chan) => chan.id === logget.log);
			if (!logchan) {
				return;
			}

			const logEmbed = new EmbedBuilder()
				.setColor(this.client.utils.color(modal.guild.members.me.displayHexColor))
				.setAuthor({ name: 'Ticket Closed', iconURL: modal.guild.iconURL({ dynamic: true }) })
				.addFields({ name: `<:ticketId:998229977004781618> **Ticket ID**`,
					value: `\`${channelArgs[channelArgs.length - 1]}\``, inline: true },
				{ name: `<:ticketOpen:998229978267258881> **Opened By**`,
					value: `${user}`, inline: true },
				{ name: `<:ticketClose:998229974634991646> **Closed By**`,
					value: `${modal.user}`, inline: true },
				{ name: `<:ticketTranscript:998229979609440266> **Transcript**`,
					value: `${transLinkText}`, inline: true },
				{ name: `<:ticketCloseTime:998229975931048028> **Time Closed**`,
					value: `<t:${epoch}>`, inline: true },
				{ name: `\u200b`,
					value: `\u200b`, inline: true },
				{ name: `🖋️ **Reason**`,
					value: `${firstResponse}` })
				.setTimestamp();
			logchan.send(transcriptRow ? { components: [transcriptRow], embeds: [logEmbed] } : { embeds: [logEmbed] });
		}
	}

};
