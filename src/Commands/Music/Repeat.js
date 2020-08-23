const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Repeats song/playlist.',
			category: 'Music',
			usage: '[queue]'
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const dlRoleGrab = db.prepare(`SELECT role FROM music WHERE guildid = ${message.guild.id}`).get();

		const dlRole = message.guild.roles.cache.find((x) => x.name === 'DJ') || message.guild.roles.cache.find((r) => r.id === dlRoleGrab.role);
		if (!dlRole) {
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || 'A10000')
				.addField(`**${this.client.user.username} - Repeat**`,
					`**◎ Error:** Sorry, I could not find a role name \`DJ\`, if you prefer, you could set a custom role as the DJ, check the command command \`${prefix}config\` for more information.`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		if (!message.member.roles.cache.has(dlRole.id) && message.author.id !== message.guild.ownerID) {
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || 'A10000')
				.addField(`**${this.client.user.username} - Repeat**`,
					`**◎ Error:** Sorry! You do not have the **${dlRole}** role.`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		if (!args[0]) {
			const player = this.client.music.players.get(message.guild.id);
			const { channel } = message.member.voice;
			if (!player) {
				const embed = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || 'A10000')
					.addField(`**${this.client.user.username} - Repeat**`,
						`**◎ Error:** <:MusicLogo:684822003110117466> No song is currently playing.`);
				message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
				return;
			}

			if (!channel || channel.id !== player.voiceChannel.id) {
				const embed = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || 'A10000')
					.addField(`**${this.client.user.username} - Repeat**`,
						`**◎ Error:** You need to be in a voice channel to use this command!`);
				message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
				return;
			}

			if (!player) {
				const embed = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || 'A10000')
					.addField(`**${this.client.user.username} - Repeat**`,
						`**◎ Error:** <:MusicLogo:684822003110117466> No song is currently playing.`);
				message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
				return;
			}

			const previousState = player.trackRepeat;

			player.setTrackRepeat(!previousState);
			if (!previousState) {
				player.setTrackRepeat(true);
				const embed = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || 'A10000')
					.addField(`**${this.client.user.username} - Repeat**`,
						`**◎ Success:** <:MusicLogo:684822003110117466> Repeat enabled.`);
				message.channel.send(embed);
			} else {
				player.setQueueRepeat(false);
				const embed = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || 'A10000')
					.addField(`**${this.client.user.username} - Repeat**`,
						`**◎ Success:** <:MusicLogo:684822003110117466> Repeat disabled.`);
				message.channel.send(embed);
			}
		} else if (args[0] === 'queue') {
			const player = this.client.music.players.get(message.guild.id);
			const { channel } = message.member.voice;
			if (!channel || channel.id !== player.voiceChannel.id) {
				const embed = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || 'A10000')
					.addField(`**${this.client.user.username} - Repeat**`,
						`**◎ Error:** You need to be in a voice channel to use this command!`);
				message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
				return;
			}

			if (!player || !player.queue[0]) {
				const embed = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || 'A10000')
					.addField(`**${this.client.user.username} - Repeat**`,
						`**◎ Error:** <:MusicLogo:684822003110117466> No song is currently playing.`);
				message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
				return;
			}

			if (player.queueRepeat === false) {
				player.setQueueRepeat(true);
				const embed = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || 'A10000')
					.addField(`**${this.client.user.username} - Repeat**`,
						`**◎ Success:** <:MusicLogo:684822003110117466> Repeat enabled.`);
				message.channel.send(embed);
				return;
			}
			player.setQueueRepeat(false);
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || 'A10000')
				.addField(`**${this.client.user.username} - Repeat**`,
					`**◎ Success:** <:MusicLogo:684822003110117466> Repeat disabled.`);
			message.channel.send(embed);
			return;
		}
	}

};
