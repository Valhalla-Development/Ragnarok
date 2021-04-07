/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Configures Twitter settings',
			category: 'Moderation'
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const twitterTable = db.prepare('SELECT * FROM twitter WHERE guild = ?').get(message.guild.id);

		let foundUsers;

		if (!twitterTable || !twitterTable.accounts) {
			foundUsers = [];
		} else {
			foundUsers = JSON.parse(twitterTable.accounts);
		}

		const regex = /^https?:\/\/(www\.)?twitter\.com\/(#!\/)?([^]+)(\/\w+)*$/;

		if (args[0] === undefined) {
			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Twitter**`,
					`**◎ Success:** Available Commands:\n\n
						\`${prefix}twitter list\` - Will show a list of monitored accounts.
						\`${prefix}twitter channel <#channel>\` - Sets the channel a message will be sent to when a monitored account tweets/retweets.
						\`${prefix}twitter add <link-to-twitter-profile>\` - Adds Twitter account to be monitored.
						\`${prefix}twitter remove <link-to-twitter-profile>\` - Removes Twitter account from the monitored accounts.`);
			message.channel.send(embed);
			return;
		}

		if (args[0] === 'list') {
			if (!twitterTable) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Twitter**`,
						`**◎ Error:** No accounts are current being monitored.`);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			const arr = [];

			foundUsers.forEach(name => {
				arr.push(`https://twitter.com/${name.username}`);
			});

			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Twitter**`,
					`**◎ Success:** The following Twitter users are being monitored:\n\n${arr.join(`\n`)}`);
			message.channel.send(embed);
		}

		if (args[0] === 'channel') {
			const channel = message.mentions.channels.first();

			if (!channel) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Twitter**`,
						`**◎ Error:** Please mention a valid channel!`);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			if (!twitterTable) {
				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Twitter**`,
						`**◎ Success:** Twitter alert channel set to ${channel}`);
				message.channel.send(embed);

				const insert = db.prepare('INSERT INTO twitter (guild, channel) VALUES (@guild, @channel);');
				insert.run({
					guild: `${message.guild.id}`,
					channel: `${channel.id}`
				});
				return;
			} else {
				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Twitter**`,
						`**◎ Success:** Twitter alert channel updated to ${channel}`);
				message.channel.send(embed);

				const update = db.prepare('UPDATE twitter SET channel = (@channel) WHERE guild = (@guild);');
				update.run({
					guild: `${message.guild.id}`,
					channel: `${channel.id}`
				});
				return;
			}
		}

		if (args[0] === 'add') {
			if (!twitterTable) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Twitter**`,
						`**◎ Error:** Please set a channel before monitoring any accounts!`);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			if (args[1] === undefined) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Twitter**`,
						`**◎ Error:** Please input a valid URL, an example would be:\n\`${prefix}twitter add https://twitter.com/testUsername\``);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			const exec = regex.exec(args[1]);

			if (!exec) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Twitter**`,
						`**◎ Error:** Please input a valid URL, an example would be:\nhttps://twitter.com/testUsername`);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			const username = exec[3];

			if (foundUsers.some(test => test.username === username)) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Twitter**`,
						`**◎ Error:** \`${username}\` is already being monitored!`);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			this.client.twitter.get('users/show', { screen_name: username }, (err, data, response) => {
				if (err) {
					this.client.utils.messageDelete(message, 10000);

					const embed = new MessageEmbed()
						.setAuthor(`${message.author.tag}`, message.author.avatarURL())
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Twitter**`,
							`**◎ Error:** I could not find a Twitter user with the name: \`${username}\``);
					message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				const twitterID = data.id;

				foundUsers.push({ username: username, id: twitterID });

				db.prepare('UPDATE twitter SET accounts = (@accounts) WHERE guild = (@guild);').run({
					guild: `${message.guild.id}`,
					accounts: JSON.stringify(foundUsers)
				});

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Twitter**`,
						`**◎ Success:** \`${username}\` will now be monitored.`);
				message.channel.send(embed);
				return;
			});
		}

		if (args[0] === 'remove') {
			if (!twitterTable) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Twitter**`,
						`**◎ Error:** No accounts are being monitored!`);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			if (args[1] === undefined) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Twitter**`,
						`**◎ Error:** Please input a valid URL, an example would be:\n\`${prefix}twitter remove https://twitter.com/testUsername\``);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			const exec = regex.exec(args[1]);
			const username = exec[3];

			if (!foundUsers.some(test => test.username === username)) {
				this.client.utils.messageDelete(message, 10000);

				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Twitter**`,
						`**◎ Error:** \`${username}\` is not being monitored!`);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			const remaining = foundUsers.filter(data => data.username !== username);

			if (remaining.length === 0) {
				foundUsers = null;
			} else {
				foundUsers = JSON.stringify(remaining);
			}

			console.log(foundUsers)
			db.prepare('UPDATE twitter SET accounts = (@accounts) WHERE guild = (@guild);').run({
				guild: `${message.guild.id}`,
				accounts: foundUsers
			});

			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Twitter**`,
					`**◎ Success:** \`${username}\` will no longer be monitored!`);
			message.channel.send(embed);
			return;
		}
	}

};
