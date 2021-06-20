const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const prettyMilliseconds = require('pretty-ms');
const progressbar = require('string-progressbar');
const { stripIndents } = require('common-tags');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Resumes music playback.',
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
				.addField(`**${this.client.user.username} - Resume**`,
					`**◎ Error:** Sorry, I could not find a role name \`DJ\`, if you prefer, you could set a custom role as the DJ, check the command command \`${prefix}config\` for more information.`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (!message.member.roles.cache.has(role.id) && message.author.id !== message.guild.ownerID) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Resume**`,
					`**◎ Error:** Sorry! You do not have the **${role}** role.`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const player = this.client.manager.players.get(message.guild.id);
		const { channel } = message.member.voice;

		if (!player) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Resume**`,
					`**◎ Error:** <:MusicLogo:684822003110117466> No song is currently playing.`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (!channel || channel.id !== player.voiceChannel) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Resume**`,
					`**◎ Error:** You need to be in a voice channel to use this command!`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (player.paused === true) {
			this.client.utils.messageDelete(message, 10000);

			player.pause(false);

			const { title, duration, requester, uri, thumbnail } = player.queue.current;

			const total = duration;
			const current = player.position;

			let formCurrent = prettyMilliseconds(current, { colonNotation: true });
			if (formCurrent.includes('.')) {
				formCurrent = formCurrent.substr(0, formCurrent.lastIndexOf('.'));
			}

			const bar = await progressbar.splitBar(total, current, 18);

			const embed = new MessageEmbed()
				.setAuthor('Resuming playback', 'https://cdn.wccftech.com/wp-content/uploads/2018/01/Youtube-music.png')
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.setThumbnail(`${thumbnail}`)
				.setDescription(stripIndents`
            [${title}](${uri})\n\n▶️ ${bar[0]}\n\n\`${formCurrent} / ${prettyMilliseconds(duration, { colonNotation: true })}\`\n\n Requested by: ${requester.tag}`);
			message.channel.send({ embeds: [embed] });
			return;
		}
		if (player.paused === false) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Resume**`,
					`**◎ Success:** <:MusicLogo:684822003110117466> Music is already playing!`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}
	}

};
