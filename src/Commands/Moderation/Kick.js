const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Kicks tagged user from the guild.',
			category: 'Moderation'
		});
	}

	async run(message) {
		// no perms check

		if (!message.member.hasPermission('KICK_MEMBERS') && !this.client.owners.includes(message.author.id)) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Kick**`,
					`**◎ Error:** You need to have the \`KICK_MEMBERS\` permission to use this command.`);
			message.channel.send(embed).then((m) => this.client.utils.messageDelete(m, 15000));
			return;
		}

		// no mention check

		if (message.mentions.users.size < 1) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Kick**`,
					`**◎ Error:** You must mention someone!`);
			message.channel.send(embed).then((m) => this.client.utils.messageDelete(m, 15000));
			return;
		}

		const user = message.mentions.users.first();

		if (user.id === message.author.id) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Kick**`,
					`**◎ Error:** You can't kick yourself <:wut:745408596233289839>`);
			message.channel.send(embed).then((m) => this.client.utils.messageDelete(m, 15000));
			return;
		}

		// perms checking again

		if (message.mentions.members.first().hasPermission('MANAGE_GUILD') || message.mentions.members.first().hasPermission('ADMINISTRATOR') || !message.mentions.members.first().kickable) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Kick**`,
					`**◎ Error:** You cannot kick <@${user.id}>`);
			message.channel.send(embed).then((m) => this.client.utils.messageDelete(m, 15000));
			return;
		}

		// other checks

		if (user.id === this.client.user.id) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Kick**`,
					`**◎ Error:** You cannot kick me. :slight_frown:`);
			message.channel.send(embed).then((m) => this.client.utils.messageDelete(m, 15000));
			return;
		}

		// message sending (await message)

		const embed = new MessageEmbed()
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Kick**`,
				`**◎ Success:** You have 30 seconds to reply to this message with a reason for kicking <@${user.id}`);
		message.channel.send(embed).then(() => {
			message.channel.awaitMessages((response) => response.author.id === message.author.id, {
				max: 1,
				time: 25000,
				errors: ['time']
			}).then((collected) => {
				message.mentions.members.first().kick({
					reason: collected.first().content
				}).then(() => {
					const embed1 = new MessageEmbed()
						.setThumbnail(this.client.user.displayAvatarURL())
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField('User Kicked', [
							`**◎ User:** ${user.name}`,
							`**◎ Reason:**: ${collected.first().content}`,
							`**◎ Moderator:**: ${message.author.tag}`
						])
						.setTimestamp();
					message.channel.send(embed1);
				});
			}).catch(() => {
				const embed2 = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Kick**`,
						`**◎ Cancelled:** Kick command canceled.`);
				message.channel.send(embed2).then((m) => this.client.utils.messageDelete(m, 15000));
			});
		});
	}

};
