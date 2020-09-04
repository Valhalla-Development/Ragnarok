const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Pauses music playback.',
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
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Pause**`,
					`**◎ Error:** Sorry, I could not find a role name \`DJ\`, if you prefer, you could set a custom role as the DJ, check the command command \`${prefix}config\` for more information.`);
			message.channel.send(embed).then((m) => this.client.utils.messageDelete(m, 15000));
			return;
		}

		if (!message.member.roles.cache.has(role.id) && message.author.id !== message.guild.ownerID) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Pause**`,
					`**◎ Error:** Sorry! You do not have the **${role}** role.`);
			message.channel.send(embed).then((m) => this.client.utils.messageDelete(m, 15000));
			return;
		}

		const player = this.client.manager.players.get(message.guild.id);
		const { channel } = message.member.voice;

		if (!player) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Pause**`,
					`**◎ Error:** <:MusicLogo:684822003110117466> No song is currently playing.`);
			message.channel.send(embed).then((m) => this.client.utils.messageDelete(m, 15000));
			return;
		}

		if (!channel || channel.id !== player.voiceChannel) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Pause**`,
					`**◎ Error:** You need to be in a voice channel to use this command!`);
			message.channel.send(embed).then((m) => this.client.utils.messageDelete(m, 15000));
			return;
		}

		if (!player.paused) {
			player.pause(true);
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Pause**`,
					`**◎ Success:** <:MusicLogo:684822003110117466> Pausing playback.`);
			message.channel.send(embed).then((m) => this.client.utils.messageDelete(m, 15000));
			return;
		}
		if (player.paused) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Pause**`,
					`**◎ Error:** <:MusicLogo:684822003110117466> Player is already paused!.`);
			message.channel.send(embed).then((m) => this.client.utils.messageDelete(m, 15000));
			return;
		}
	}

};
