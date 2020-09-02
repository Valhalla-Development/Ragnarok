/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const talkedRecently = new Set();
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const prettyMilliseconds = require('pretty-ms');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Plays/searches for input.',
			category: 'Music',
			usage: '<search term/url>'
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
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Play**`,
					`**◎ Error:** Sorry, I could not find a role name \`DJ\`, if you prefer, you could set a custom role as the DJ, check the command command \`${prefix}config\` for more information.`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		const { channel } = message.member.voice;
		if (!channel) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Play**`,
					`**◎ Error:** You need to be in a voice channel to use this command!`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}


		const permissions = channel.permissionsFor(this.client.user);
		if (!permissions.has('CONNECT')) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Play**`,
					`**◎ Error:** I cannot connect to your voice channel, make sure I have permissions!`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		if (!permissions.has('SPEAK')) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Play**`,
					`**◎ Error:** I cannot connect to your voice channel, make sure I have permissions!`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		if (talkedRecently.has(message.author.id)) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Play**`,
					`**◎ Error:** There is a 30 second cooldown for this command!\nDJ's are exempt from the cooldown.`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		} // add check if role was added after cooldown bub

		if (!args[0]) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Play**`,
					`**◎ Error:** Please provide an URL or a search term.`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		const player = this.client.manager.create({
			guild: message.guild.id,
			voiceChannel: message.member.voice.channel.id,
			textChannel: message.channel.id
		});

		await this.client.manager.search(args.join(' '), message.author).then(async (res) => {
			if (res.loadType === 'NO_MATCHES' || res.loadType === 'LOAD_FAILED') {
				if (message.member.guild.me.hasPermission('MANAGE_MESSAGES')) {
					message.delete();
				}
				const noTrack = new MessageEmbed()
					.setAuthor('Error', 'https://upload.wikimedia.org/wikipedia/commons/7/73/YouTube_Music.png')
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.setDescription(`No tracks found.`);
				message.channel.send(noTrack).then((m) => m.delete({ timeout: 15000 }));
				return;
			}
			player.set('textChannel', message.channel);
			switch (res.loadType) {
				case 'TRACK_LOADED': {
					if (res.tracks[0].duration >= 600000) {
						const embed1 = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Play**`,
								`**◎ Error:** Duration is over 10 minutes! Cancelling playback`);
						message.channel.send(embed1).then((me) => me.delete({ timeout: 15000 }));
						if (player.queue.size === 0) {
							player.destroy(message.guild.id);
						}
						return;
					}
					player.queue.add(res.tracks[0]);
					player.connect();
					if (!player.playing && !player.paused && player.queue.size === 1) player.play();
					if (player.queue.size !== 1) {
						const trackloade = new MessageEmbed()
							.setAuthor('Enqueueing.', 'https://upload.wikimedia.org/wikipedia/commons/7/73/YouTube_Music.png')
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.setDescription(`\`${res.tracks[0].title}\`\nDuration: \`${prettyMilliseconds(res.tracks[0].duration, { colonNotation: true })}\`\nRequested by: ${message.author}`);
						message.channel.send(trackloade);
					}
					break;
				}

				case 'SEARCH_RESULT': {
					let index = 1;
					const tracks = res.tracks.slice(0, 5);
					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Play**`,
							tracks.map((video) => `**◎ ${index++} -** ${video.title} - \`${prettyMilliseconds(video.duration, { colonNotation: true })}\``))
						.setThumbnail('https://upload.wikimedia.org/wikipedia/commons/7/73/YouTube_Music.png')
						.setFooter("Type the track number you wish to play. You have 30 seconds to respond.\nType 'cancel' to cancel the selection");

					await message.channel.send(embed).then((searchEmbed) => {
						const collector = message.channel.createMessageCollector((m) => m.author.id === message.author.id && new RegExp('^([1-5]|cancel)$', 'i').test(m.content), {
							time: 30000,
							max: 1
						});

						collector.on('collect', (m) => {
							if (/cancel/i.test(m.content)) return collector.stop('cancelled');
							const track = tracks[Number(m.content) - 1];
							if (track.duration >= 600000) {
								if (message.member.guild.me.hasPermission('MANAGE_MESSAGES')) {
									searchEmbed.delete();
									m.delete();
								}
								const embed1 = new MessageEmbed()
									.setColor(this.client.utils.color(message.guild.me.displayHexColor))
									.addField(`**${this.client.user.username} - Play**`,
										`**◎ Error:** Duration is over 10 minutes! Cancelling playback`);
								message.channel.send(embed1).then((me) => me.delete({ timeout: 15000 }));
								if (player.queue.size === 0) {
									player.destroy(message.guild.id);
								}
								return;
							}
							if (message.member.guild.me.hasPermission('MANAGE_MESSAGES')) {
								searchEmbed.delete();
								m.delete();
							}
							player.queue.add(track);
							player.connect();
							if (!player.playing && !player.paused && player.queue.size === 1) player.play();
							if (player.queue.size !== 1) {
								const trackloade = new MessageEmbed()
									.setAuthor('Enqueuing Track.', 'https://upload.wikimedia.org/wikipedia/commons/7/73/YouTube_Music.png')
									.setColor(this.client.utils.color(message.guild.me.displayHexColor))
									.setDescription(`\`${track.title}\`\nDuration: \`${prettyMilliseconds(track.duration, { colonNotation: true })}\`\nRequested by: ${message.author}`);
								message.channel.send(trackloade);
							}
						});

						collector.on('end', (_, reason) => {
							if (['time', 'cancelled'].includes(reason)) {
								const upperReason = reason.charAt(0).toUpperCase() + reason.substring(1);
								const cancelE = new MessageEmbed()
									.setAuthor(' Cancelled', 'https://upload.wikimedia.org/wikipedia/commons/7/73/YouTube_Music.png')
									.setColor(this.client.utils.color(message.guild.me.displayHexColor))
									.setDescription(`Search results cancelled.\nReason: \`${upperReason}\``);
								message.channel.send(cancelE).then((msg) => msg.delete({ timeout: 15000 }));
								if (message.member.guild.me.hasPermission('MANAGE_MESSAGES')) {
									searchEmbed.delete();
								}
								if (player.queue.size === 0) {
									player.destroy(message.guild.id);
								}
								return;
							}
						});
					});
					break;
				}
				case 'PLAYLIST_LOADED': {
					res.tracks.forEach((track) => player.queue.add(track));
					const duration = prettyMilliseconds(res.tracks.reduce((acc, cur) => ({
						duration: acc.duration + cur.duration
					})).duration, { colonNotation: true });
					player.connect();
					if (!player.playing && !player.paused && player.queue.size === res.tracks.length) player.play();
					if (player.queue.size !== 1) {
						const playlistload = new MessageEmbed()
							.setAuthor('Enqueuing Playlist.', 'https://upload.wikimedia.org/wikipedia/commons/7/73/YouTube_Music.png')
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.setDescription(`Enqueuing \`${res.tracks.length}\` tracks in playlist \`${res.playlist.name}\`\nTotal duration: \`${duration}\``);
						message.channel.send(playlistload);
					}
					break;
				}
			}
		}).catch((err) => message.channel.send(`\`${err.message}\``));
		if (message.member.roles.cache.has(role.id)) {
			return;
		}
		talkedRecently.add(message.author.id);
		setTimeout(() => {
			const embed1 = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Play**`,
					`**◎ Success:** <@${message.author.id}> You can now use the play command again.`);
			message.channel.send(embed1).then((me) => me.delete({ timeout: 15000 }));
			talkedRecently.delete(message.author.id);
		}, 30000);
	}

};
