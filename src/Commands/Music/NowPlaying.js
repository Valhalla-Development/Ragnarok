const Command = require('../../Structures/Command');
const { stripIndents } = require('common-tags');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const prettyMilliseconds = require('pretty-ms');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['np'],
			description: 'Displays current song playing.',
			category: 'Music'
		});
	}

	async run(message) {
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
				.addField(`**${this.client.user.username} - NowPlaying**`,
					`**◎ Error:** Sorry, I could not find a role name \`DJ\`, if you prefer, you could set a custom role as the DJ, check the command command \`${prefix}config\` for more information.`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const player = this.client.manager.players.get(message.guild.id);
		if (!player || !player.queue.current) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - NowPlaying**`,
					`**◎ Error:** <:MusicLogo:684822003110117466> No song is currently playing.`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const { title, duration, requester } = player.queue.current;
		const embed = new MessageEmbed()
			.setAuthor('Current Song Playing', 'https://cdn.wccftech.com/wp-content/uploads/2018/01/Youtube-music.png')
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.setThumbnail('https://cdn.wccftech.com/wp-content/uploads/2018/01/Youtube-music.png')
			.setDescription(stripIndents`
            ${player.playing ? '▶️' : '⏸️'} **${title}** \`${prettyMilliseconds(duration, { colonNotation: true })}\` Requested by: [${requester}]`);
		message.channel.send({ embeds: [embed] });
		return;
	}

};
