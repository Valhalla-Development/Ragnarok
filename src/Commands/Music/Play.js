/* eslint-disable consistent-return */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const { Utils } = require('erela.js');
const talkedRecently = new Set();
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'E',
			aliases: ['E'],
			description: 'E',
			category: 'E',
			usage: 'E'
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
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**No DJ Role**',
					`**◎ Error:** Sorry, I could not find a role name \`DJ\`, if you prefer, you could set a custom role as the DJ, check the command command \`${prefix}config\` for more information.`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		const { channel } = message.member.voice;
		if (!channel) {
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**Not In Voice**',
					`**◎ Error:** You need to be in a voice channel to use this command!`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}


		const permissions = channel.permissionsFor(this.client.user);
		if (!permissions.has('CONNECT')) {
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**Invalid Perms**',
					`**◎ Error:** I cannot connect to your voice channel, make sure I have permissions!`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		if (!permissions.has('SPEAK')) {
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**Invalid Perms**',
					`**◎ Error:** I cannot connect to your voice channel, make sure I have permissions!`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		if (talkedRecently.has(message.author.id)) {
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**Slow Down!**',
					`**◎ Error:** There is a 30 second cooldown for this command!\nDJ's are exempt from the cooldown.`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
		} else {
			if (!args[0]) {
				const embed = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Incorrect Usage**',
						`**◎ Error:** Please provide an URL or a search term.`);
				message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
				return;
			}

			const player = this.client.music.players.spawn({
				guild: message.guild,
				textChannel: message.channel,
				voiceChannel: channel
			});

			this.client.music.search(args.join(' '), message.author).then(async (res) => {
				switch (res.loadType) {
					case 'TRACK_LOADED': {
						player.queue.add(res.tracks[0]);
						const trackloade = new MessageEmbed()
							.setAuthor('Enqueueing.', 'https://upload.wikimedia.org/wikipedia/commons/7/73/YouTube_Music.png')
							.setColor(message.guild.me.displayHexColor || '36393F')
							.setDescription(`\`${res.tracks[0].title}\`\nDuration: \`${Utils.formatTime(res.tracks[0].duration, true)}\`\nRequested by: ${message.author}`);
						message.channel.send(trackloade);
						if (!player.playing) player.play();
						break;
					}

					case 'SEARCH_RESULT': {
						let index = 1;
						const tracks = res.tracks.slice(0, 10);
						const embed = new MessageEmbed()
							.setAuthor('Search Results.')
							.setColor(message.guild.me.displayHexColor || '36393F')
							.setThumbnail('https://upload.wikimedia.org/wikipedia/commons/7/73/YouTube_Music.png')
							.setDescription(tracks.map((video) => `**${index++} -** ${video.title} - \`${Utils.formatTime(video.duration, true)}\``))
							.setFooter("Type the track number you wish to play. You have 30 seconds to respond.\nType 'cancel' to cancel the selection");

						await message.channel.send(embed);

						const collector = message.channel.createMessageCollector((m) => m.author.id === message.author.id && new RegExp('^([1-9]|10|cancel)$', 'i').test(m.content), {
							time: 30000,
							max: 1
						});

						collector.on('collect', (m) => {
							if (/cancel/i.test(m.content)) return collector.stop('cancelled');
							const track = tracks[Number(m.content) - 1];
							if (track.duration >= 600000) {
								const embed1 = new MessageEmbed()
									.setColor(message.guild.me.displayHexColor || '36393F')
									.addField('**Playback Limit**',
										`**◎ Error:** Duration is over 10 minutes! Cancelling playback`);
								message.channel.send(embed1).then((me) => me.delete({ timeout: 15000 }));
								if (player.queue.size <= 0) {
									this.client.music.players.destroy(message.guild.id);
								}
								return;
							}
							player.queue.add(track);
							if (!player.playing) player.play();
							const trackloade = new MessageEmbed()
								.setAuthor('Enqueuing Track.', 'https://upload.wikimedia.org/wikipedia/commons/7/73/YouTube_Music.png')
								.setColor(message.guild.me.displayHexColor || '36393F')
								.setDescription(`\`${track.title}\`\nDuration: \`${Utils.formatTime(track.duration, true)}\`\nRequested by: ${message.author}`);
							message.channel.send(trackloade);
						});

						collector.on('end', (_, reason) => {
							if (['time', 'cancelled'].includes(reason)) {
								const upperReason = reason.charAt(0).toUpperCase() + reason.substring(1);
								const cancelE = new MessageEmbed()
									.setAuthor(' Cancelled', 'https://upload.wikimedia.org/wikipedia/commons/7/73/YouTube_Music.png')
									.setColor(message.guild.me.displayHexColor || '36393F')
									.setDescription(`Search results cancelled.\nReason: \`${upperReason}\``);
								message.channel.send(cancelE).then((msg) => msg.delete({ timeout: 15000 }));
								if (player.queue.size <= 0) {
									this.client.music.players.destroy(message.guild.id);
								}
								return;
							}
						});
						break;
					}

					case 'PLAYLIST_LOADED': {
						res.playlist.tracks.forEach((track) => player.queue.add(track));
						const duration = Utils.formatTime(res.playlist.tracks.reduce((acc, cur) => ({
							duration: acc.duration + cur.duration
						})).duration, true);
						if (player.queue.length < 1) return;
						if (!player.playing) player.play();
						const playlistload = new MessageEmbed()
							.setAuthor('Enqueuing Playlist.', 'https://upload.wikimedia.org/wikipedia/commons/7/73/YouTube_Music.png')
							.setColor(message.guild.me.displayHexColor || '36393F')
							.setDescription(`Enqueuing \`${res.playlist.tracks.length}\` \`${duration}\` tracks in playlist \`${res.playlist.info.name}\``);
						message.channel.send(playlistload);
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
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Playback Limit Lifted**',
						`**◎ Success:** You can now use the play command again.`);
				message.channel.send(message.author, embed1).then((me) => me.delete({ timeout: 15000 }));
				talkedRecently.delete(message.author.id);
			}, 30000);
		}
	}

};
