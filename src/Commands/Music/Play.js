/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');
const { MessageEmbed, Permissions, MessageButton, MessageActionRow } = require('discord.js');
const talkedRecently = new Set();
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const prettyMilliseconds = require('pretty-ms');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Plays/searches for input.',
			category: 'Music',
			usage: '<search term/url>',
			botPerms: ['CONNECT', 'SPEAK']
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const dlRoleGrab = db.prepare(`SELECT role FROM music WHERE guildid = ${message.guild.id}`).get();

		let role;
		if (dlRoleGrab) {
			role = message.guild.roles.cache.find((r) => r.id === dlRoleGrab.role);
		} else {
			role = message.guild.roles.cache.find((x) => x.name === 'DJ');
		}

		if (!role) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Play**`,
					`**◎ Error:** Sorry, I could not find a role name \`DJ\`, if you prefer, you could set a custom role as the DJ, check the command command \`${prefix}config\` for more information.`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const { channel } = message.member.voice;
		if (!channel) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Play**`,
					`**◎ Error:** You need to be in a voice channel to use this command!`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const permissions = channel.permissionsFor(this.client.user);
		if (!permissions.has(Permissions.FLAGS.CONNECT)) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Play**`,
					`**◎ Error:** I cannot connect to your voice channel, make sure I have permissions!`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (!permissions.has(Permissions.FLAGS.SPEAK)) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Play**`,
					`**◎ Error:** I cannot connect to your voice channel, make sure I have permissions!`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (!message.member.roles.cache.has(role.id) || !message.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
			if (talkedRecently.has(message.author.id)) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Play**`,
						`**◎ Error:** Please only run one instance of this command!`);
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
		}

		if (talkedRecently.has(message.author.id)) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Play**`,
					`**◎ Error:** There is a 30 second cooldown for this command!\nDJ's are exempt from the cooldown.`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (!args[0]) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Play**`,
					`**◎ Error:** Please provide an URL or a search term.`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const player = this.client.manager.create({
			guild: message.guild.id,
			voiceChannel: message.member.voice.channel.id,
			textChannel: message.channel.id
		});

		await talkedRecently.add(message.author.id);

		await this.client.manager.search(args.join(' '), message.author).then(async (res) => {
			if (res.loadType === 'NO_MATCHES' || res.loadType === 'LOAD_FAILED') {
				this.client.utils.messageDelete(message, 10000);
				if (talkedRecently.has(message.author.id)) {
					talkedRecently.delete(message.author.id);
				}

				this.client.utils.messageDelete(message, 10000);

				const noTrack = new MessageEmbed()
					.setAuthor('Error', 'https://cdn.wccftech.com/wp-content/uploads/2018/01/Youtube-music.png')
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.setDescription(`No tracks found.`);
				message.channel.send({ embeds: [noTrack] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
			player.set('textChannel', message.channel);

			switch (res.loadType) {
				case 'TRACK_LOADED': {
					this.client.utils.messageDelete(message, 10000);

					if (res.tracks[0].duration >= 900000) {
						const embed1 = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Play**`,
								`**◎ Error:** Duration is over 15 minutes! Cancelling playback`);
						message.channel.send({ embeds: [embed1] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						if (!player.queue.current) {
							player.destroy(message.guild.id);
						}
						if (talkedRecently.has(message.author.id)) {
							talkedRecently.delete(message.author.id);
						}
						return;
					}
					player.queue.add(res.tracks[0]);
					if (!player.playing && !player.paused && !player.queue.size) {
						player.setVoiceChannel(message.member.voice.channel.id);
						player.play();
					}

					if (player.queue.size) {
						const trackloade = new MessageEmbed()
							.setAuthor('Enqueueing.', 'https://cdn.wccftech.com/wp-content/uploads/2018/01/Youtube-music.png')
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.setDescription(`\`${res.tracks[0].title}\`\nDuration: \`${prettyMilliseconds(res.tracks[0].duration, { colonNotation: true })}\`\nRequested by: ${message.author}`);
						message.channel.send({ embeds: [trackloade] });
					}
					break;
				}

				case 'SEARCH_RESULT': {
					const buttonA = new MessageButton()
						.setStyle('SUCCESS')
						.setEmoji('1️⃣')
						.setCustomId('one');

					const buttonB = new MessageButton()
						.setStyle('SUCCESS')
						.setEmoji('2️⃣')
						.setCustomId('two');

					const buttonC = new MessageButton()
						.setStyle('SUCCESS')
						.setEmoji('3️⃣')
						.setCustomId('three');

					const buttonD = new MessageButton()
						.setStyle('SUCCESS')
						.setEmoji('4️⃣')
						.setCustomId('four');

					const buttonE = new MessageButton()
						.setStyle('SUCCESS')
						.setEmoji('5️⃣')
						.setCustomId('five');

					const buttonF = new MessageButton()
						.setStyle('DANGER')
						.setLabel('Cancel')
						.setCustomId('cancel');

					const row = new MessageActionRow()
						.addComponents(buttonA, buttonB, buttonC, buttonD, buttonE);

					const row1 = new MessageActionRow()
						.addComponents(buttonF);

					let index = 1;
					const getTracks = res.tracks.filter(t => t.duration <= 900000);
					const tracks = getTracks.slice(0, 5);

					if (!tracks.length) {
						this.client.utils.messageDelete(message, 10000);

						const noTrack = new MessageEmbed()
							.setAuthor('Error', 'https://cdn.wccftech.com/wp-content/uploads/2018/01/Youtube-music.png')
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.setDescription(`No tracks found.`);
						message.channel.send({ embeds: [noTrack] }).then((m) => this.client.utils.deletableCheck(m, 10000));
						if (talkedRecently.has(message.author.id)) {
							talkedRecently.delete(message.author.id);
						}
						return;
					}

					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Play**`,
							`${tracks.map((video) => `**◎ ${index++} -** [${video.title}](${video.uri}) - \`${prettyMilliseconds(video.duration, { colonNotation: true })}\``).join('\n\n')}`)
						.setThumbnail('https://cdn.wccftech.com/wp-content/uploads/2018/01/Youtube-music.png')
						.setFooter('Click the corresponding button for the track you wish to play. You have 30 seconds to respond.');

					const searchEmbed = await message.channel.send({ components: [row, row1], embeds: [embed] });
					const filter = (but) => but.user.id !== this.client.user.id;

					const collector = searchEmbed.createMessageComponentCollector(filter, { time: 30000 });

					collector.on('collect', async (b) => {
						if (b.user.id !== message.author.id) {
							const wrongUser = new MessageEmbed()
								.setColor(this.client.utils.color(message.guild.me.displayHexColor))
								.addField(`**${this.client.user.username} - Play**`,
									`**◎ Error:** Only the command executor can choose a track!`);
							b.reply.send({ embeds: [wrongUser] }, true);
							return;
						}

						this.client.utils.messageDelete(searchEmbed, 10000);

						if (message.member.roles.cache.has(role.id) || message.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
							if (talkedRecently.has(message.author.id)) {
								talkedRecently.delete(message.author.id);
							}
						}

						if (b.customId === 'cancel') {
							collector.stop('cancel');
							return;
						}

						let track;
						if (b.customId === 'one') {
							track = tracks[Number(1) - 1];
						}
						if (b.customId === 'two') {
							track = tracks[Number(2) - 1];
						}
						if (b.customId === 'three') {
							track = tracks[Number(3) - 1];
						}
						if (b.customId === 'four') {
							track = tracks[Number(4) - 1];
						}
						if (b.customId === 'five') {
							track = tracks[Number(5) - 1];
						}

						if (track.duration >= 900000) {
							collector.stop('duration');
							return;
						}

						player.queue.add(track);

						if (!player.playing && !player.paused && !player.queue.size) {
							player.setVoiceChannel(message.member.voice.channel.id);
							player.play();
						}

						if (player.queue.size) {
							const trackloade = new MessageEmbed()
								.setAuthor('Enqueuing Track.', 'https://cdn.wccftech.com/wp-content/uploads/2018/01/Youtube-music.png')
								.setColor(this.client.utils.color(message.guild.me.displayHexColor))
								.setDescription(`\`${track.title}\`\nDuration: \`${prettyMilliseconds(track.duration, { colonNotation: true })}\`\nRequested by: ${message.author}`);
							message.channel.send({ embeds: [trackloade] });
						}

						collector.stop('playing');
					});

					collector.on('end', (_, reason) => {
						this.client.utils.deletableCheck(searchEmbed, 0);
						this.client.utils.deletableCheck(message, 0);

						if (message.member.roles.cache.has(role.id) || message.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
							if (talkedRecently.has(message.author.id)) {
								talkedRecently.delete(message.author.id);
							}
						}

						if (reason === 'duration') {
							const embed1 = new MessageEmbed()
								.setColor(this.client.utils.color(message.guild.me.displayHexColor))
								.addField(`**${this.client.user.username} - Play**`,
									`**◎ Error:** Duration is over 10 minutes! Cancelling playback`);
							message.channel.send({ embeds: [embed1] }).then((msg) => this.client.utils.deletableCheck(msg, 10000));
							if (!player.queue.current) {
								player.destroy(message.guild.id);
							}
							if (talkedRecently.has(message.author.id)) {
								talkedRecently.delete(message.author.id);
							}
							return;
						}

						if (['time', 'cancel'].includes(reason)) {
							if (talkedRecently.has(message.author.id)) {
								talkedRecently.delete(message.author.id);
							}

							const upperReason = reason.charAt(0).toUpperCase() + reason.substring(1);
							const cancelE = new MessageEmbed()
								.setAuthor(' Cancelled', 'https://cdn.wccftech.com/wp-content/uploads/2018/01/Youtube-music.png')
								.setColor(this.client.utils.color(message.guild.me.displayHexColor))
								.setDescription(`Search results cancelled.\nReason: \`${upperReason}\``);
							message.channel.send({ embeds: [cancelE] }).then((m) => this.client.utils.deletableCheck(m, 10000));
							this.client.utils.deletableCheck(searchEmbed, 10000);
							if (!player.queue.current) {
								player.destroy(message.guild.id);
							}
							return;
						}
					});
					break;
				}

				case 'PLAYLIST_LOADED': {
					this.client.utils.messageDelete(message, 10000);
					message.channel.sendTyping();

					if (res.tracks.length > 10) {
						if (!message.member.roles.cache.has(role.id) || !message.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
							const embed = new MessageEmbed()
								.setColor(this.client.utils.color(message.guild.me.displayHexColor))
								.addField(`**${this.client.user.username} - Play**`,
									`**◎ Error:** Only members with the ${role} role may load a playlist with more than 10 tracks!`);
							message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
							if (talkedRecently.has(message.author.id)) {
								talkedRecently.delete(message.author.id);
							}
							return;
						}
					}
					message.channel.send({ content: 'Enqueuing Tracks...' }).then(async (enq) => {
						const filterDur = await res.tracks.filter(t => t.duration <= 900000);

						if (!filterDur.length) {
							this.client.utils.messageDelete(message, 10000);

							const noTrack = new MessageEmbed()
								.setAuthor('Error', 'https://cdn.wccftech.com/wp-content/uploads/2018/01/Youtube-music.png')
								.setColor(this.client.utils.color(message.guild.me.displayHexColor))
								.setDescription(`No tracks found.`);
							message.channel.send({ embeds: [noTrack] }).then((m) => this.client.utils.deletableCheck(m, 10000));
							if (talkedRecently.has(message.author.id)) {
								talkedRecently.delete(message.author.id);
							}
							return;
						}

						filterDur.forEach((track) => player.queue.add(track));

						const duration = prettyMilliseconds(filterDur.reduce((acc, cur) => ({
							duration: acc.duration + cur.duration
						})).duration, { colonNotation: true });

						if (!player.playing && !player.paused && player.queue.size === filterDur.length - 1) {
							player.setVoiceChannel(message.member.voice.channel.id);
							player.play();
						}

						if (player.queue.size) {
							const playlistload = new MessageEmbed()
								.setAuthor('Enqueuing Playlist.', 'https://cdn.wccftech.com/wp-content/uploads/2018/01/Youtube-music.png')
								.setColor(this.client.utils.color(message.guild.me.displayHexColor))
								.setDescription(`Enqueuing \`${filterDur.length}\` tracks in playlist \`${res.playlist.name}\`\nTotal duration: \`${duration}\``);
							message.channel.send({ embeds: [playlistload] });
						}
						this.client.utils.deletableCheck(enq, 0);
					});
					break;
				}
			}
		}).catch((err) => message.channel.send(`\`${err.message}\``));
		if (message.member.roles.cache.has(role.id)) {
			return;
		}
		setTimeout(() => {
			if (message.member.roles.cache.has(role.id) || message.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
				return;
			}
			const embed1 = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Play**`,
					`**◎ Success:** <@${message.author.id}> You can now use the play command again.`);
			message.channel.send({ embeds: [embed1] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			talkedRecently.delete(message.author.id);
		}, 30000);
	}

};
