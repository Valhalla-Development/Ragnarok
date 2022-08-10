const Event = require('../../Structures/Event');
const { EmbedBuilder, PermissionsBitField, MessageButton, MessageActionRow, Modal, TextInputComponent } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 7);
const discordTranscripts = require('discord-html-transcripts');
const fetchPkg = require('node-fetch-cjs');

module.exports = class extends Event {

	async run(interaction) {
		if (interaction.isModalSubmit()) {
			if (interaction.customId === `modal-${interaction.channelId}`) {
				const fetchTick = db.prepare(`SELECT * FROM tickets`).all();
				if (!fetchTick) return;

				// Filter fetchTick where chanid === interaction.channel.id
				const ticket = fetchTick.find(t => t.chanid === interaction.channelId);
				if (!ticket) return;

				const firstResponse = interaction.fields.getTextInputValue(`textinput-${interaction.channelId}`);

				await interaction.deferReply({ ephemeral: true });
				const embed = new EmbedBuilder()
					.setColor(this.client.utils.color(interaction.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Ticket**`,
						`Please stand-by while I gather all messages. This may take a while dependant on how many messages are in this channel.`);
				interaction.followUp({ embeds: [embed] });

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
				const staticFileName = `${interaction.channel.name}-_-${staticFileNameGen}.html`;
				const { channel } = interaction;

				channel.name = staticFileName;

				const fixedName = interaction.channel.name.substr(0, interaction.channel.name.indexOf('-_-'));

				const attachment = await discordTranscripts.createTranscript(channel, {
					limit: -1,
					returnBuffer: true,
					saveImages: true,
					fileName: staticFileName
				});

				const buffered = Buffer.from(attachment.attachment).toString();

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

				if (interaction.channel) {
					channel.name = fixedName;
					interaction.channel.delete();
				}

				const channelArgs = interaction.channel.name.split('-');

				const deleteTicket = db.prepare(`DELETE FROM tickets WHERE guildid = ${interaction.guild.id} AND ticketid = (@ticketid)`);
				deleteTicket.run({
					ticketid: channelArgs[channelArgs.length - 1]
				});

				const epoch = Math.floor(new Date().getTime() / 1000);

				const user = this.client.users.cache.find((a) => a.id === ticket.authorid);
				if (user) {
					const logEmbed = new EmbedBuilder()
						.setColor(this.client.utils.color(interaction.guild.me.displayHexColor))
						.setAuthor({ name: 'Ticket Closed', iconURL: interaction.guild.iconURL({ dynamic: true }) })
						.addFields({ name: `<:ticketId:998229977004781618> **Ticket ID**`, value: `\`${channelArgs[channelArgs.length - 1]}\``, inline: true },
							{ name: `<:ticketOpen:998229978267258881> **Opened By**`, value: `${user}`, inline: true },
							{ name: `<:ticketClose:998229974634991646> **Closed By**`, value: `${interaction.user}`, inline: true },
							{ name: `<:ticketTranscript:998229979609440266> **Transcript**`, value: `${transLinkText}`, inline: true },
							{ name: `<:ticketCloseTime:998229975931048028> **Time Closed**`, value: `<t:${epoch}>`, inline: true },
							{ name: `\u200b`, value: `\u200b`, inline: true },
							{ name: `🖋️ **Reason**`, value: `${firstResponse}` })
						.setTimestamp();
					user.send(transcriptRow ? { components: [transcriptRow], embeds: [logEmbed] } : { embeds: [logEmbed] }).then(() => {
					// eslint-disable-next-line arrow-body-style
					}).catch(() => {
						return;
					});
				}

				const logget = db.prepare(`SELECT log FROM ticketConfig WHERE guildid = ${interaction.guild.id};`).get();
				if (!logget) {
					return;
				}

				const logchan = interaction.guild.channels.cache.find((chan) => chan.id === logget.log);
				if (!logchan) {
					return;
				}

				const logEmbed = new EmbedBuilder()
					.setColor(this.client.utils.color(interaction.guild.me.displayHexColor))
					.setAuthor({ name: 'Ticket Closed', iconURL: interaction.guild.iconURL({ dynamic: true }) })
					.addFields({ name: `<:ticketId:998229977004781618> **Ticket ID**`, value: `\`${channelArgs[channelArgs.length - 1]}\``, inline: true },
						{ name: `<:ticketOpen:998229978267258881> **Opened By**`, value: `${user}`, inline: true },
						{ name: `<:ticketClose:998229974634991646> **Closed By**`, value: `${interaction.user}`, inline: true },
						{ name: `<:ticketTranscript:998229979609440266> **Transcript**`, value: `${transLinkText}`, inline: true },
						{ name: `<:ticketCloseTime:998229975931048028> **Time Closed**`, value: `<t:${epoch}>`, inline: true },
						{ name: `\u200b`, value: `\u200b`, inline: true },
						{ name: `🖋️ **Reason**`, value: `${firstResponse}` })
					.setTimestamp();
				logchan.send(transcriptRow ? { components: [transcriptRow], embeds: [logEmbed] } : { embeds: [logEmbed] });
			}
		}

		if (!interaction.isButton()) return;

		if (interaction.customId === 'closeTicket' || interaction.customId === 'closeTicketReason') {
			const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(interaction.guild.id);
			const { prefix } = prefixgrab;

			// Check if the button is inside a valid ticket
			const guild = this.client.guilds.cache.get(interaction.guild.id);
			const fetchRole = db.prepare(`SELECT * FROM ticketConfig WHERE guildid = ${guild.id}`).get();
			if (!fetchRole) return;

			if (fetchRole.role) {
				if (!guild.roles.cache.find((role) => role.id === fetchRole.role)) {
					const updateRole = db.prepare(`UPDATE ticketConfig SET role = (@role) WHERE guildid = ${guild.id}`);
					updateRole.run({
						role: null
					});
				}
			}

			const fetchTick = db.prepare(`SELECT * FROM tickets`).all();
			if (!fetchTick) return;

			// Filter fetchTick where chanid === interaction.channel.id
			const ticket = fetchTick.find(t => t.chanid === interaction.channel.id);
			if (!ticket) return;

			// Check if bot has perms
			if (!guild.me.permissions.has(PermissionsBitField.ManageChannels)) {
				const botPerm = new EmbedBuilder()
					.setColor(this.client.utils.color(guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Ticket**`,
						`**◎ Error:** It seems you have removed the \`MANAGE_CHANNELS\` permission from me. I cannot function properly without it :cry:`);
				interaction.channel.send({ embeds: [botPerm] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				await interaction.deferUpdate();
				return;
			}

			// "Support" role
			if (!guild.roles.cache.find((r) => r.name === 'Support Team') && !fetchRole.role) {
				const nomodRole = new EmbedBuilder()
					.setColor(this.client.utils.color(guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Ticket**`,
						`**◎ Error:** This server doesn't have a \`Support Team\` role made, so the ticket can't be opened.\nIf you are an administrator, you can run the command \`${prefix}config ticket role @role\`, alternatively, you can create the role with that name \`Support Team\` and give it to users that should be able to see tickets.`);
				interaction.channel.send({ embeds: [nomodRole] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				await interaction.deferUpdate();
				return;
			}

			// If no reason
			if (interaction.customId === 'closeTicket') {
				interaction.channel.sendTyping();
				const embed = new EmbedBuilder()
					.setColor(this.client.utils.color(guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Ticket**`,
						`Please stand-by while I gather all messages. This may take a while dependant on how many messages are in this channel.`);
				interaction.channel.send({ embeds: [embed] });

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
				const staticFileName = `${interaction.channel.name}-_-${staticFileNameGen}.html`;
				const { channel } = interaction;

				channel.name = staticFileName;

				const fixedName = interaction.channel.name.substr(0, interaction.channel.name.indexOf('-_-'));

				const attachment = await discordTranscripts.createTranscript(channel, {
					limit: -1,
					returnBuffer: true,
					saveImages: true,
					fileName: staticFileName
				});
				const buffered = Buffer.from(attachment.attachment).toString();

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

				if (interaction.channel) {
					channel.name = fixedName;
					interaction.channel.delete();
				}

				const channelArgs = interaction.channel.name.split('-');

				const deleteTicket = db.prepare(`DELETE FROM tickets WHERE guildid = ${guild.id} AND ticketid = (@ticketid)`);
				deleteTicket.run({
					ticketid: channelArgs[channelArgs.length - 1]
				});

				const epoch = Math.floor(new Date().getTime() / 1000);

				const user = this.client.users.cache.find((a) => a.id === ticket.authorid);
				if (user) {
					const logEmbed = new EmbedBuilder()
						.setColor(this.client.utils.color(guild.me.displayHexColor))
						.setAuthor({ name: 'Ticket Closed', iconURL: guild.iconURL({ dynamic: true }) })
						.addFields({ name: `<:ticketId:998229977004781618> **Ticket ID**`, value: `\`${channelArgs[channelArgs.length - 1]}\``, inline: true },
							{ name: `<:ticketOpen:998229978267258881> **Opened By**`, value: `${user}`, inline: true },
							{ name: `<:ticketClose:998229974634991646> **Closed By**`, value: `${interaction.user}`, inline: true },
							{ name: `<:ticketTranscript:998229979609440266> **Transcript**`, value: `${transLinkText}`, inline: true },
							{ name: `<:ticketCloseTime:998229975931048028> **Time Closed**`, value: `<t:${epoch}>`, inline: true },
							{ name: `\u200b`, value: `\u200b`, inline: true })
						.setTimestamp();
					user.send(transcriptRow ? { components: [transcriptRow], embeds: [logEmbed] } : { embeds: [logEmbed] }).then(() => {
						// eslint-disable-next-line arrow-body-style
					}).catch(() => {
						return;
					});
				}

				const logget = db.prepare(`SELECT log FROM ticketConfig WHERE guildid = ${guild.id};`).get();
				if (!logget) {
					return;
				}

				const logchan = guild.channels.cache.find((chan) => chan.id === logget.log);
				if (!logchan) {
					return;
				}

				const logEmbed = new EmbedBuilder()
					.setColor(this.client.utils.color(guild.me.displayHexColor))
					.setAuthor({ name: 'Ticket Closed', iconURL: guild.iconURL({ dynamic: true }) })
					.addFields({ name: `<:ticketId:998229977004781618> **Ticket ID**`, value: `\`${channelArgs[channelArgs.length - 1]}\``, inline: true },
						{ name: `<:ticketOpen:998229978267258881> **Opened By**`, value: `${user}`, inline: true },
						{ name: `<:ticketClose:998229974634991646> **Closed By**`, value: `${interaction.user}`, inline: true },
						{ name: `<:ticketTranscript:998229979609440266> **Transcript**`, value: `${transLinkText}`, inline: true },
						{ name: `<:ticketCloseTime:998229975931048028> **Time Closed**`, value: `<t:${epoch}>`, inline: true },
						{ name: `\u200b`, value: `\u200b`, inline: true })
					.setTimestamp();
				logchan.send(transcriptRow ? { components: [transcriptRow], embeds: [logEmbed] } : { embeds: [logEmbed] });
			}

			if (interaction.customId === 'closeTicketReason') {
				const modal = new Modal()
					.setCustomId(`modal-${ticket.chanid}`)
					.setTitle('Close Ticket');

				const reasonModal = new TextInputComponent()
					.setCustomId(`textinput-${ticket.chanid}`)
					.setLabel('Reason')
					.setStyle('PARAGRAPH')
					.setMinLength(4)
					.setMaxLength(400)
					.setPlaceholder('Input your reason for closing this ticket')
					.setRequired(true);

				const firstActionRow = new MessageActionRow().addComponents(reasonModal);

				modal.addComponents(firstActionRow);

				await interaction.showModal(modal, {
					client: this.client,
					interaction: interaction
				});
			}
		}

		if (interaction.customId === 'createTicket') {
			const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(interaction.guild.id);
			const { prefix } = prefixgrab;

			// Ticket Embed
			const guild = this.client.guilds.cache.get(interaction.guild.id);
			const fetch = db.prepare(`SELECT * FROM ticketConfig WHERE guildid = ${guild.id}`).get();
			if (!fetch) {
				const alreadyTicket = new EmbedBuilder()
					.setColor(this.client.utils.color(guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Ticket**`,
						`**◎ Error:** No ticket configuration found.\n\nPlease ask an administrator to set up the ticket system.`);
				interaction.reply({ embeds: [alreadyTicket], ephemeral: true });
				return;
			}
			const channel = guild.channels.cache.get(fetch.ticketembedchan);

			if (!fetch.ticketembed) {
				interaction.message.delete();
				await interaction.deferUpdate();
				return;
			}

			if (!guild.me.permissions.has(PermissionsBitField.ManageChannels)) {
				const botPerm = new EmbedBuilder()
					.setColor(this.client.utils.color(guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Ticket**`,
						`**◎ Error:** It seems you have removed the \`MANAGE_CHANNELS\` permission from me. I cannot function properly without it :cry:`);
				channel.send({ embeds: [botPerm] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				await interaction.deferUpdate();
				return;
			}

			// "Support" role
			if (!guild.roles.cache.find((r) => r.name === 'Support Team') && !fetch.role) {
				const nomodRole = new EmbedBuilder()
					.setColor(this.client.utils.color(guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Ticket**`,
						`**◎ Error:** This server doesn't have a \`Support Team\` role made, so the ticket can't be opened.\nIf you are an administrator, you can run the command \`${prefix}config ticket role @role\`, alternatively, you can create the role with that name \`Support Team\` and give it to users that should be able to see tickets.`);
				channel.send({ embeds: [nomodRole] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				await interaction.deferUpdate();
				return;
			}

			// Make sure this is the user's only ticket.
			const foundTicket = db.prepare(`SELECT authorid FROM tickets WHERE guildid = ${guild.id} AND authorid = (@authorid)`);
			const checkTicketEx = db.prepare(`SELECT chanid FROM tickets WHERE guildid = ${guild.id} AND authorid = ${interaction.user.id}`).get();

			if (checkTicketEx) {
				if (checkTicketEx.chanid === null) {
					db.prepare(`DELETE FROM tickets WHERE guildid = ${guild.id} AND authorid = ${interaction.user.id}`).run();
				}
				if (!guild.channels.cache.find((ch) => ch.id === checkTicketEx.chanid)) {
					db.prepare(`DELETE FROM tickets WHERE guildid = ${guild.id} AND authorid = ${interaction.user.id}`).run();
				}
			}

			if (fetch.role) {
				if (!guild.roles.cache.find((role) => role.id === fetch.role)) {
					const updateRole = db.prepare(`UPDATE ticketConfig SET role = (@role) WHERE guildid = ${guild.id}`);
					updateRole.run({
						role: null
					});
				}
			}

			// Already has a ticket
			if (foundTicket.get({ authorid: interaction.user.id })) {
				try {
					const cha = guild.channels.cache.get(checkTicketEx.chanid);
					const alreadyTicket = new EmbedBuilder()
						.setColor(this.client.utils.color(guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Ticket**`,
							`**◎ Error:** It seems you already have a ticket open. | ${cha}`);
					interaction.reply({ embeds: [alreadyTicket], ephemeral: true });
					return;
				} catch (e) {
					await interaction.deferUpdate();
					console.log(e);
					return;
				}
			}

			// Make Ticket
			const id = db.prepare(`SELECT category FROM ticketConfig WHERE guildid = ${guild.id};`).get();
			const reason = '';
			const randomString = nanoid();
			const nickName = guild.members.cache.get(interaction.user.id).displayName;

			const newTicket = db.prepare('INSERT INTO tickets (guildid, ticketid, authorid, reason) values (@guildid, @ticketid, @authorid, @reason);');
			newTicket.run({
				guildid: guild.id,
				ticketid: randomString,
				authorid: interaction.user.id,
				reason
			});
			const ticategory = id.category;
			// Create the channel with the name "ticket-" then the user's ID.
			const role = interaction.guild.roles.cache.find((x) => x.name === 'Support Team') || interaction.guild.roles.cache.find((r) => r.id === fetch.role);
			const role2 = channel.guild.roles.everyone;

			// Check how many channels are in the category
			const category = interaction.guild.channels.cache.find((chan) => chan.id === id.category);
			const categoryLength = category && category.children ? category.children.size : 0;

			let newId;
			// Check if the category has the max amount of channels
			if (categoryLength >= 50) {
			// Clone the category
				await category.clone({ name: `${category.name}`, reason: 'max channels per category reached' }).then((chn) => {
					chn.setParent(category.parentId);
					chn.setPosition(category.rawPosition + 1);

					newId = chn.id;

					// Update the database
					const update = db.prepare('UPDATE ticketConfig SET category = (@category) WHERE guildid = (@guildid);');
					update.run({
						guildid: `${interaction.guild.id}`,
						category: `${chn.id}`
					});
				});
			}

			interaction.guild.channels.create(`ticket-${nickName}-${randomString}`, {
				parent: newId || (ticategory || null),
				permissionOverwrites: [
					{
						id: role.id,
						allow: [PermissionsBitField.ViewChannel, PermissionsBitField.SendMessages]
					},
					{
						id: role2.id,
						deny: PermissionsBitField.ViewChannel
					},
					{
						id: interaction.user.id,
						allow: [PermissionsBitField.ViewChannel, PermissionsBitField.SendMessages]
					},
					{
						id: this.client.user.id,
						allow: [PermissionsBitField.ViewChannel, PermissionsBitField.SendMessages]
					}
				]
			}).then((c) => {
				const updateTicketChannel = db.prepare(`UPDATE tickets SET chanid = (@chanid) WHERE guildid = ${guild.id} AND ticketid = (@ticketid)`);
				updateTicketChannel.run({
					chanid: c.id,
					ticketid: randomString
				});
				const newTicketE = new EmbedBuilder()
					.setColor(this.client.utils.color(interaction.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Ticket**`,
						`**◎ Success:** Your ticket has been created, <#${c.id}>.`);
				interaction.reply({ embeds: [newTicketE], ephemeral: true });

				const buttonClose = new MessageButton()
					.setStyle('DANGER')
					.setLabel('🔒 Close')
					.setCustomId('closeTicket');

				const buttonCloseReason = new MessageButton()
					.setStyle('DANGER')
					.setLabel('🔒 Close With Reason')
					.setCustomId('closeTicketReason');

				const row = new MessageActionRow()
					.addComponents(buttonClose, buttonCloseReason);

				const embed = new EmbedBuilder()
					.setColor(this.client.utils.color(interaction.guild.me.displayHexColor))
					.setTitle(`New Ticket`)
					.setDescription(`Welcome to our support system ${interaction.user}.\nPlease hold tight and a support member will be with you shortly.${reason ? `\n\n\nYou opened this ticket for the following reason:\n\`\`\`${reason}\`\`\`` : '\n\n\n**Please specify a reason for opening this ticket.**'}`);
				c.send({ components: [row], embeds: [embed] });

				if (id) {
					if (!fetch.log) {
						return;
					}

					const logchan = guild.channels.cache.find((chan) => chan.id === fetch.log);
					if (!logchan) return;

					const openEpoch = Math.floor(new Date().getTime() / 1000);

					const logEmbed = new EmbedBuilder()
						.setColor(this.client.utils.color(guild.me.displayHexColor))
						.setAuthor({ name: 'Ticket Opened', iconURL: guild.iconURL({ dynamic: true }) })
						.addFields({ name: `<:ticketId:998229977004781618> **Ticket ID**`, value: `[${randomString}](https://discord.com/channels/${interaction.guild.id}/${c.id})`, inline: true },
							{ name: `<:ticketOpen:998229978267258881> **Opened By**`, value: `${interaction.user}`, inline: true },
							{ name: `<:ticketCloseTime:998229975931048028> **Time Opened**`, value: `<t:${openEpoch}>`, inline: true },
							{ name: `🖋️ **Reason**`, value: `${reason || 'No reason provided.'}`, inline: true })
						.setTimestamp();
					logchan.send({ embeds: [logEmbed] });
				}
			}).catch(console.error);
		}

		if (interaction.customId.startsWith('rm-')) {
			const guild = this.client.guilds.cache.get(interaction.guild.id);
			const user = guild.members.cache.get(interaction.user.id);

			const lastRole = interaction.customId.lastIndexOf('-');

			const roleTrim = interaction.customId.substring(interaction.customId.length, lastRole + 1);

			const role = guild.roles.cache.get(roleTrim);

			// Fetch the db
			const foundRoleMenu = db.prepare(`SELECT * FROM rolemenu WHERE guildid=${interaction.guild.id}`).get();

			// Parse the data
			const roleArray = JSON.parse(foundRoleMenu.roleList);

			// Check if roles in the array exist in the server, if it does not, remove it from the array
			const roleArrayCleaned = roleArray.filter((roleCheck) => {
				if (interaction.guild.roles.cache.has(roleCheck)) {
					return true;
				} else {
					return false;
				}
			});

			if (!roleArrayCleaned.includes(role.id)) {
				const alreadyRole = new EmbedBuilder()
					.setColor(this.client.utils.color(guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Role Menu**`,
						`**◎ Error:** The role you selected no longer exists on the server.`);
				interaction.reply({ embeds: [alreadyRole], ephemeral: true });

				db.prepare('UPDATE rolemenu SET activeRoleMenuID = (@activeRoleMenuID), roleList = (@roleList) WHERE guildid = (@guildid);').run({
					roleList: JSON.stringify(roleArrayCleaned),
					guildid: `${interaction.guild.id}`
				});
				return;
			}

			// check if user has role already
			if (user.roles.cache.has(role.id)) {
				user.roles.remove(role).then(() => {
					const alreadyRole = new EmbedBuilder()
						.setColor(this.client.utils.color(guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Role Menu**`,
							`**◎ Success:** I have removed the ${role} role from you.`);
					interaction.reply({ embeds: [alreadyRole], ephemeral: true });
				}).catch(() => {
					const embed = new EmbedBuilder()
						.setColor(this.client.utils.color(guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Rolemenu**`,
							`**◎ Error:** An error occured.`);
					interaction.reply({ embeds: [embed], ephemeral: true });
				});
			} else {
				// add role to user
				user.roles.add(role).then(() => {
					const embed = new EmbedBuilder()
						.setColor(this.client.utils.color(guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Rolemenu**`,
							`**◎ Success:** I have added the ${role} role to you!`);
					interaction.reply({ embeds: [embed], ephemeral: true });
				}).catch(() => {
					const embed = new EmbedBuilder()
						.setColor(this.client.utils.color(guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Rolemenu**`,
							`**◎ Error:** An error occured.`);
					interaction.reply({ embeds: [embed], ephemeral: true });
				});
			}
		}
	}

};
