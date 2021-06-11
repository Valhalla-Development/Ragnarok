/* eslint-disable consistent-return */
/* eslint-disable no-mixed-operators */
/* eslint-disable camelcase */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const prettyMilliseconds = require('pretty-ms');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Displays current song queue.',
			category: 'Music'
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
				.addField(`**${this.client.user.username} - Queue**`,
					`**◎ Error:** Sorry, I could not find a role name \`DJ\`, if you prefer, you could set a custom role as the DJ, check the command command \`${prefix}config\` for more information.`);
			message.channel.send({ embed: embed }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const player = this.client.manager.players.get(message.guild.id);
		const { channel } = message.member.voice;

		if (!player) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Queue**`,
					`**◎ Error:** <:MusicLogo:684822003110117466> No song is currently playing.`);
			message.channel.send({ embed: embed }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (!channel || channel.id !== player.voiceChannel) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Queue**`,
					`**◎ Error:** You need to be in a voice channel to use this command!`);
			message.channel.send({ embed: embed }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (!player.queue.current) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Queue**`,
					`**◎ Error:** There is no queue!`);
			message.channel.send({ embed: embed }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const embed1 = new MessageEmbed()
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Queue**`,
				`**◎ Error:** There is no queue!`);

		const embed2 = new MessageEmbed()
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Queue**`,
				`**◎ Success:** <:MusicLogo:684822003110117466> The queue has been cleared.`);

		if (args[0] === 'clear') {
			this.client.utils.messageDelete(message, 10000);

			if (player.queue.size) {
				message.channel.send({ embed: embed1 }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
			player.queue.clear();
			message.channel.send({ embed: embed2 });
			return;
		}

		const { queue } = player;

		const embed = new MessageEmbed();
		embed.setAuthor(`${message.guild.name}'s Queue (${player.queue.size})`);
		embed.setColor(this.client.utils.color(message.guild.me.displayHexColor));

		// change for the amount of tracks per page
		const multiple = 10;
		const page = args.length && Number(args[0]) ? Number(args[0]) : 1;

		const end = page * multiple;
		const start = end - multiple;

		const tracks = queue.slice(start, end);

		if (player.queue.size === 0) {
			embed.setDescription(`🎧 Now Playing:\n [${queue.current.title}](${queue.current.uri}) [<@${queue.current.requester.id}>] - \`${prettyMilliseconds(queue.current.duration, { colonNotation: true })}\``);
			message.channel.send({ embed: embed });
			return;
		}

		embed.setDescription(`🎧 Now Playing:\n [${queue.current.title}](${queue.current.uri}) [<@${queue.current.requester.id}>] - \`${prettyMilliseconds(queue.current.duration, { colonNotation: true })}\`\n${tracks.map((track, i) => `**◎ ${start + ++i} -** [${track.title}](${track.uri}) [${track.requester}] - \`${prettyMilliseconds(track.duration, { colonNotation: true })}\``).join('\n')}`);
		embed.setThumbnail('https://upload.wikimedia.org/wikipedia/commons/7/73/YouTube_Music.png');

		const maxPages = Math.ceil(queue.length / multiple);

		embed.setFooter(`Page ${page > maxPages ? maxPages : page} of ${maxPages}`);

		message.channel.send({ embed: embed });
	}

};
