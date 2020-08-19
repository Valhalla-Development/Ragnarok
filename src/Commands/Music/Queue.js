/* eslint-disable no-mixed-operators */
/* eslint-disable camelcase */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
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
				.addField(`**${this.client.user.username} - Queue**`,
					`**◎ Error:** Sorry, I could not find a role name \`DJ\`, if you prefer, you could set a custom role as the DJ, check the command command \`${prefix}config\` for more information.`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		const player = this.client.music.players.get(message.guild.id);
		if (!player) {
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField(`**${this.client.user.username} - Queue**`,
					`**◎ Error:** <:MusicLogo:684822003110117466> No song is currently playing.`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		if (player.queue.length < 1) {
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField(`**${this.client.user.username} - Queue**`,
					`**◎ Error:** There is no queue!`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		const { title, requester, uri } = player.queue[0];

		const { queue } = player;

		const embed1 = new MessageEmbed()
			.setColor(message.guild.me.displayHexColor || '36393F')
			.addField(`**${this.client.user.username} - Queue**`,
				`**◎ Error:** There is no queue!`);

		const embed2 = new MessageEmbed()
			.setColor(message.guild.me.displayHexColor || '36393F')
			.addField(`**${this.client.user.username} - Queue**`,
				`**◎ Success:** <:MusicLogo:684822003110117466> The queue has been cleared.`);


		if (args[0] === 'clear') {
			if (player.queue.length < 1) {
				message.channel.send(embed1).then((m) => m.delete({ timeout: 15000 }));
				return;
			}
			player.queue.clear();
			message.channel.send(embed2);
			return;
		}

		if (!player.queue[1]) {
			message.channel.send('', {
				embed: {
					description: `🎧 Now Playing:\n[${title}](${uri}) [<@${requester.id}>]`,
					color: message.guild.me.displayHexColor || '36393F',
					author: {
						name: `${message.guild.name}'s Queue.`,
						icon_url: 'https://upload.wikimedia.org/wikipedia/commons/7/73/YouTube_Music.png'
					}
				}
			});
			return;
		}

		let x;
		if (args > 1) {
			x = Math.floor(args) * 10 + 1;
		} else {
			x = Math.floor(11);
		}
		let i;
		if (args > 1) {
			i = x - 11;
		} else {
			i = 0;
		}
		let queuelist = player.queue.slice(x - 10, x).map(() => `**${++i}.** [${queue[i].title}](${queue[i].uri}) [<@${queue[i].requester.id}>]`).join('\n');
		if (!queuelist) {
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField(`**${this.client.user.username} - Queue**`,
					`**◎ Error:** Page doesn't exist!`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}
		const embed = new MessageEmbed();
		embed.setDescription(`🎧 Now Playing:\n [${title}](${uri}) [<@${requester.id}>]\n__Up Next__:\n${queuelist}`);
		embed.setThumbnail('https://upload.wikimedia.org/wikipedia/commons/7/73/YouTube_Music.png');
		embed.setAuthor(`${message.guild.name}'s Queue (${Math.floor(x / 10)} / ${Math.floor((player.queue.slice(1).length + 10) / 10)})`);
		embed.setFooter(`Total items in queue: ${player.queue.length}`);
		embed.setColor(message.guild.me.displayHexColor || '36393F');
		message.channel.send(embed).then(async (msg) => {
			if (Math.floor((player.queue.slice(1).length + 10) / 10) > 1) {
				await msg.react('⏪');
				await msg.react('◀');
				await msg.react('🟣');
				await msg.react('▶');
				await msg.react('⏩');
				const pages = Math.floor((player.queue.slice(1).length + 10) / 10);
				let page = Math.floor(x / 10);
				const back = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '◀' && user.id === message.author.id, { time: 60000 });
				const doubleback = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏪' && user.id === message.author.id, { time: 60000 });
				const doubleforwad = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '⏩' && user.id === message.author.id, { time: 60000 });
				const forwad = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '▶' && user.id === message.author.id, { time: 60000 });
				const middle = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '🟣' && user.id === message.author.id, { time: 60000 });
				msg.delete({ timeout: 60000 });
				back.on('collect', async (r) => {
					if (page === 1) return r.users.remove(message.author);
					await r.users.remove(message.author);
					await page--;
					x = Math.floor(page) * 10 + 1;
					i = x - 11;
					queuelist = player.queue.slice(x - 10, x).map(() => `**${++i}.** [${queue[i].title}](${queue[i].uri}) [<@${queue[i].requester.id}>]`).join('\n');
					embed.setDescription(`🎧 Now Playing:\n [${title}](${uri}) [<@${requester.id}>]\n__Up Next__:\n${queuelist}`);
					embed.setAuthor(`${message.guild.name}'s Queue (${page} / ${pages})`);
					msg.edit(embed);
				});
				forwad.on('collect', async (r) => {
					if (page === pages) return r.users.remove(message.author);
					await r.users.remove(message.author);
					await page++;
					x = Math.floor(page) * 10 + 1;
					i = x - 11;
					queuelist = player.queue.slice(x - 10, x).map(() => `**${++i}.** [${queue[i].title}](${queue[i].uri}) [<@${queue[i].requester.id}>]`).join('\n');
					embed.setDescription(`🎧 Now Playing:\n [${title}](${uri}) [<@${requester.id}>]\n__Up Next__:\n${queuelist}`);
					embed.setAuthor(`${message.guild.name}'s Queue (${page} / ${pages})`);
					msg.edit(embed);
				});
				doubleback.on('collect', async (r) => {
					if (page === 1) return r.users.remove(message.author);
					await r.users.remove(message.author);
					page = 1;
					x = Math.floor(page) * 10 + 1;
					i = x - 11;
					queuelist = player.queue.slice(x - 10, x).map(() => `**${++i}.** [${queue[i].title}](${queue[i].uri}) [<@${queue[i].requester.id}>]`).join('\n');
					embed.setDescription(`🎧 Now Playing:\n [${title}](${uri}) [<@${requester.id}>]\n__Up Next__:\n${queuelist}`);
					embed.setAuthor(`${message.guild.name}'s Queue (${page} / ${pages})`);
					msg.edit(embed);
				});
				doubleforwad.on('collect', async (r) => {
					if (page === pages) return r.users.remove(message.author);
					await r.users.remove(message.author);
					page = pages;
					x = Math.floor(page) * 10 + 1;
					i = x - 11;
					queuelist = player.queue.slice(x - 10, x).map(() => `**${++i}.** [${queue[i].title}](${queue[i].uri}) [<@${queue[i].requester.id}>]`).join('\n');
					embed.setDescription(`🎧 Now Playing:\n [${title}](${uri}) [<@${requester.id}>]\n__Up Next__:\n${queuelist}`);
					embed.setAuthor(`${message.guild.name}'s Queue (${page} / ${pages})`);
					msg.edit(embed);
				});
				middle.on('collect', async (r) => r.users.remove(message.author));
			}
		});
	}

};
