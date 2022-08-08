/* eslint-disable max-depth */
/* eslint-disable no-shadow */
const Event = require('../../Structures/Event');
const { MessageEmbed, Permissions, MessageButton, MessageActionRow } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 7);

module.exports = class extends Event {

	async run(event) {
		const eventType = event.t;
		const data = event.d;

		async function ticketEmbed(grabClient) {
			if (eventType === 'MESSAGE_DELETE') {
				const channel = await grabClient.channels.cache.find(channel => channel.id === data.channel_id);

				if (channel.type === 'DM') return;

				if (data.user_id === grabClient.user.id) return;
				const getTicketEmbed = db.prepare(`SELECT * FROM ticketConfig WHERE guildid = ${data.guild_id}`).get();
				if (!getTicketEmbed || !getTicketEmbed.ticketembed) {
					return;
				}
				if (getTicketEmbed.ticketconfig === data.id) {
					db.prepare(`UPDATE ticketConfig SET ticketembed = '' WHERE guildid = ${data.guild_id}`).run();
				}
			}
			if (eventType === 'MESSAGE_REACTION_REMOVE' || eventType === 'MESSAGE_REACTION_REMOVE_ALL') {
				const channel = await grabClient.channels.cache.find(channel => channel.id === data.channel_id);
				if (channel.type === 'DM') return;

				const emoji = '📩';
				const guild = grabClient.guilds.cache.find((guild) => guild.id === data.guild_id);
				const foundTicketConfig = db.prepare(`SELECT * FROM ticketconfig WHERE guildid = ${data.guild_id}`).get();
				if (!foundTicketConfig) {
					return;
				}
				if (eventType === 'MESSAGE_REACTION_REMOVE') {
					if (foundTicketConfig.ticketembed === data.message_id) {
						if (emoji.includes(data.emoji.name)) {
							const channel = guild.channels.cache.find((channel) => channel.id === data.channel_id);
							channel.messages.fetch(foundTicketConfig.ticketembed).then((msg) => {
								msg.react('📩');
							});
						}
					}
				}
				if (eventType === 'MESSAGE_REACTION_REMOVE_ALL') {
					if (foundTicketConfig.ticketembed === data.message_id) {
						const channel = guild.channels.cache.find((channel) => channel.id === data.channel_id);
						channel.messages.fetch(foundTicketConfig.ticketembed).then((msg) => {
							msg.react('📩');
						});
					}
				}
			}
			if (eventType === 'MESSAGE_REACTION_ADD') {
				const channel = await grabClient.channels.cache.find(channel => channel.id === data.channel_id);
				if (channel.type === 'DM') return;

				const emoji = '📩';
				if (data.user_id === grabClient.user.id) return;
				const guild = grabClient.guilds.cache.find((guild) => guild.id === data.guild_id);
				const member = guild.members.cache.find((member) => member.id === data.user_id);
				const fetch = db.prepare(`SELECT * FROM ticketconfig WHERE guildid = ${data.guild_id}`).get();
				if (!fetch) {
					return;
				}
				if (fetch.ticketembed === data.message_id) {
					const channel = guild.channels.cache.find((channel) => channel.id === data.channel_id);
					channel.messages.fetch(fetch.ticketembed).then((msg) => {
						const reaction = msg.reactions.cache.get(data.emoji.name) || msg.reactions.cache.get(`${data.emoji.name}:${data.emoji.id}`);
						if (member.id !== grabClient.user.id) {
							if (emoji.includes(data.emoji.name)) {
								if (eventType === 'MESSAGE_REACTION_ADD') {
									reaction.users.remove(member.id);
									// Ticket Embed
									const channel = guild.channels.cache.get(fetch.ticketembedchan);

									if (!guild.me.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) return;

									// "Support" role
									if (!guild.roles.cache.find((r) => r.name === 'Support Team') && !fetch.role) return;

									// Make sure this is the user's only ticket.
									const foundTicket = db.prepare(`SELECT authorid FROM tickets WHERE guildid = ${guild.id} AND authorid = (@authorid)`);
									const checkTicketEx = db.prepare(`SELECT chanid FROM tickets WHERE guildid = ${guild.id} AND authorid = ${member.id}`).get();

									if (checkTicketEx) {
										if (checkTicketEx.chanid === null) {
											db.prepare(`DELETE FROM tickets WHERE guildid = ${guild.id} AND authorid = ${member.id}`).run();
										}
										if (!guild.channels.cache.find((ch) => ch.id === checkTicketEx.chanid)) {
											db.prepare(`DELETE FROM tickets WHERE guildid = ${guild.id} AND authorid = ${member.id}`).run();
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
									if (foundTicket.get({ authorid: member.id })) {
										return;
									}

									// Make Ticket
									const id = db.prepare(`SELECT category FROM ticketConfig WHERE guildid = ${guild.id};`).get();
									const reason = '';
									const randomString = nanoid();
									const nickName = guild.members.cache.get(member.id).displayName;

									const newTicket = db.prepare('INSERT INTO tickets (guildid, ticketid, authorid, reason) values (@guildid, @ticketid, @authorid, @reason);');
									newTicket.run({
										guildid: guild.id,
										ticketid: randomString,
										authorid: member.id,
										reason
									});
									const ticategory = id.category;
									// Create the channel with the name "ticket-" then the user's ID.
									const role = guild.roles.cache.find((x) => x.name === 'Support Team') || guild.roles.cache.find((r) => r.id === fetch.role);
									const role2 = channel.guild.roles.everyone;

									// Check how many channels are in the category
									const category = guild.channels.cache.find((chan) => chan.id === id.category);
									const categoryLength = category && category.children ? category.children.size : 0;

									let newId;
									// Check if the category has the max amount of channels
									if (categoryLength >= 50) {
										// Clone the category
										category.clone({ name: `${category.name}`, reason: 'max channels per category reached' }).then((chn) => {
											chn.setParent(category.parentId);
											chn.setPosition(category.rawPosition + 1);

											newId = chn.id;

											// Update the database
											const update = db.prepare('UPDATE ticketConfig SET category = (@category) WHERE guildid = (@guildid);');
											update.run({
												guildid: `${guild.id}`,
												category: `${chn.id}`
											});
										});
									}

									guild.channels.create(`ticket-${nickName}-${randomString}`, {
										parent: newId || (ticategory || null),
										permissionOverwrites: [
											{
												id: role.id,
												allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]
											},
											{
												id: role2.id,
												deny: Permissions.FLAGS.VIEW_CHANNEL
											},
											{
												id: member.id,
												allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]
											},
											{
												id: grabClient.user.id,
												allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]
											}
										]
									}).then((c) => {
										const updateTicketChannel = db.prepare(`UPDATE tickets SET chanid = (@chanid) WHERE guildid = ${guild.id} AND ticketid = (@ticketid)`);
										updateTicketChannel.run({
											chanid: c.id,
											ticketid: randomString
										});
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

										const embed = new MessageEmbed()
											.setColor(grabClient.utils.color(guild.me.displayHexColor))
											.setTitle('New Ticket')
											.setDescription(`Welcome to our support system ${member}.\nPlease hold tight and a support member will be with you shortly.${reason ? `\n\n\nYou opened this ticket for the following reason:\n\`\`\`${reason}\`\`\`` : '\n\n\n**Please specify a reason for opening this ticket.**'}`);
										c.send({ components: [row], embeds: [embed] });

										if (id) {
											if (!fetch.log) {
												return;
											}

											const logchan = guild.channels.cache.find((chan) => chan.id === fetch.log);
											if (!logchan) return;

											const openEpoch = Math.floor(new Date().getTime() / 1000);

											const logEmbed = new MessageEmbed()
												.setColor(grabClient.utils.color(guild.me.displayHexColor))
												.setAuthor({ name: 'Ticket Opened', iconURL: guild.iconURL({ dynamic: true }) })
												.addFields({ name: `<:ticketId:998229977004781618> **Ticket ID**`, value: `[${randomString}](https://discord.com/channels/${guild.id}/${c.id})`, inline: true },
													{ name: `<:ticketOpen:998229978267258881> **Opened By**`, value: `${member.user}`, inline: true },
													{ name: `<:ticketCloseTime:998229975931048028> **Time Opened**`, value: `<t:${openEpoch}>`, inline: true },
													{ name: `🖋️ **Reason**`, value: `${reason || 'No reason provided.'}`, inline: true });
											logchan.send({ embeds: [logEmbed] });
										}
									});
								}
								reaction.users.remove(member.id);
							} else {
								try {
									reaction.users.remove(member.id);
								} catch {
									msg.reactions.removeAll();
									msg.react('📩');
								}
							}
						}
					});
				}
			}
		}
		ticketEmbed(this.client);
	}

};
