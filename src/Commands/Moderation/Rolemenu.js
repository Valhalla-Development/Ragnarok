/* eslint-disable no-undef */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const alphaEmoji = [
	'🇦',
	'🇧',
	'🇨',
	'🇩',
	'🇪',
	'🇫',
	'🇬',
	'🇭',
	'🇮',
	'🇯',
	'🇰',
	'🇱',
	'🇲',
	'🇳',
	'🇴',
	'🇵',
	'🇶',
	'🇷',
	'🇸',
	'🇹',
	'🇺',
	'🇻',
	'🇼',
	'🇽',
	'🇾',
	'🇿'
];

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

	async run(message) {
		if (!message.member.hasPermission('MANAGE_GUILD') && !this.client.owners.includes(message.author.id)) {
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**Invalid Perms**',
					`**◎ Error:** You do not have permission to run this command.`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
		} else {
			const foundRoleMenu = db.prepare(`SELECT * FROM rolemenu WHERE guildid=${message.guild.id}`).get();
			if (!foundRoleMenu || JSON.parse(foundRoleMenu.roleList).length <= 0) {
				const embed = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**No RoleMenu**',
						`**◎ Error:** The roles for the menu have not been set yet. Please try again later.`);
				message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			} else {
				const roleArray = JSON.parse(foundRoleMenu.roleList);
				let embedRoleList = '';

				for (i = 0; i < roleArray.length; i++) {
					embedRoleList += `${alphaEmoji[i]} - <@&${roleArray[i]}>\n\n`;
				}

				const roleMenuEmbed = new MessageEmbed()
					.setColor('36393F')
					.setTitle('Assign a Role')
					.setDescription(`React below to assign one of the following roles:\n\n${embedRoleList}`);
				message.channel.send(roleMenuEmbed).then(async (reactEmbed) => {
					db.prepare(`UPDATE rolemenu SET activeRoleMenuID = ${reactEmbed.id} WHERE guildid = ${message.guild.id}`).run();
					for (i = 0; i < roleArray.length; i++) {
						await reactEmbed.react(alphaEmoji[i]);
					}
				});
			}
		}
	}

};
