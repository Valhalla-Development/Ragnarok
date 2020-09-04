const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Skips current song playing.',
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
				.addField(`**${this.client.user.username} - Skip**`,
					`**◎ Error:** Sorry, I could not find a role name \`DJ\`, if you prefer, you could set a custom role as the DJ, check the command command \`${prefix}config\` for more information.`);
			message.channel.send(embed).then((m) => this.client.utils.messageDelete(m, 15000));
			return;
		}

		const player = this.client.manager.players.get(message.guild.id);
		const { channel } = message.member.voice;

		if (!player) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Skip**`,
					`**◎ Error:** <:MusicLogo:684822003110117466> No song is currently playing.`);
			message.channel.send(embed).then((m) => this.client.utils.messageDelete(m, 15000));
			return;
		}

		if (!channel || channel.id !== player.voiceChannel) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Skip**`,
					`**◎ Error:** You need to be in a voice channel to use this command!`);
			message.channel.send(embed).then((m) => this.client.utils.messageDelete(m, 15000));
			return;
		}

		if (message.member.roles.cache.has(role.id) || message.author.id === message.guild.ownerID) {
			if (player.trackRepeat) {
				player.stop();
				const success1 = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Skip**`,
						`**◎ Success:** <:MusicLogo:684822003110117466> Repeat is enabled so I restarted the track.\nTo disable repeat, run \`${prefix}repeat\``);
				message.channel.send(success1).then((m) => this.client.utils.messageDelete(m, 15000));
				return;
			}

			player.stop();
			if (player.queue.size === 1) {
				player.destroy();
			}

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Skip**`,
					`**◎ Success:** <:MusicLogo:684822003110117466> Skipped the current song.`);
			message.channel.send(embed);
			return;
		}

		const fetchChannel = this.client.channels.cache.get(player.voiceChannel);
		const userCount = fetchChannel.members.size - 1;

		if (userCount === 1) {
			player.stop();
			if (player.queue.size === 1) {
				player.destroy();
			}
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Skip**`,
					`**◎ Success:** <:MusicLogo:684822003110117466> Skipped the current song.`);
			message.channel.send(embed);
			return;
		}

		const embed = new MessageEmbed()
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Skip**`,
				`**◎ Vote to Skip:** <:MusicLogo:684822003110117466> React with ✅ to skip!\nVote will end in 15 seconds. Votes needed: ${Math.round(userCount / 2)}`);
		message.channel.send(embed).then(async (msg) => {
			await msg.react('✅');

			const skip = msg.createReactionCollector((reaction) => reaction.emoji.name === '✅', { time: 15000 });

			setTimeout(() => {
				if (skip.total >= Math.round(userCount / 2)) {
					if (player.trackRepeat) {
						const success1 = new MessageEmbed()
							.setColor(this.client.utils.color(message.guild.me.displayHexColor))
							.addField(`**${this.client.user.username} - Skip**`,
								`**◎ Success:** <:MusicLogo:684822003110117466> Repeat is enabled so I restarted the track.\nTo disable repeat, run \`${prefix}repeat\``);
						message.channel.send(success1).then((m) => this.client.utils.messageDelete(m, 15000));
						this.client.utils.messageDelete(msg, 0);
						return;
					}

					player.stop();
					if (player.queue.size === 1) {
						player.destroy();
					}

					const success2 = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Skip**`,
							`**◎ Success:** <:MusicLogo:684822003110117466> Skipped the current song.`);
					message.channel.send(success2).then((m) => this.client.utils.messageDelete(m, 15000));
					this.client.utils.messageDelete(msg, 0);
					return;
				} else {
					const fail = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Skip**`,
							`**◎ Error:** <:MusicLogo:684822003110117466> Not enough people voted!\nReceived ${skip.total}/${Math.round(userCount / 2)}`);
					message.channel.send(fail).then((m) => this.client.utils.messageDelete(m, 15000));
					this.client.utils.messageDelete(msg, 0);
				}
			}, 15000);
		});
	}

};
