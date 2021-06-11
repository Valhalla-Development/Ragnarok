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
			description: 'Posts the role menu with pre-defiend roles.',
			category: 'Moderation',
			userPerms: ['MANAGE_GUILD'],
			botPerms: ['ADD_REACTIONS']
		});
	}

	async run(message) {
		this.client.utils.messageDelete(message, 0);

		const foundRoleMenu = db.prepare(`SELECT * FROM rolemenu WHERE guildid=${message.guild.id}`).get();
		if (!foundRoleMenu || JSON.parse(foundRoleMenu.roleList).length <= 0) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - RoleMenu**`,
					`**◎ Error:** The roles for the menu have not been set yet. Please try again later.`);
			message.channel.send({ embed: embed }).then((m) => this.client.utils.deletableCheck(m, 10000));
		} else {
			const roleArray = JSON.parse(foundRoleMenu.roleList);
			let embedRoleList = '';

			let i;

			for (i = 0; i < roleArray.length; i++) {
				embedRoleList += `${alphaEmoji[i]} - <@&${roleArray[i]}>\n\n`;
			}

			const roleMenuEmbed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.setTitle('Assign a Role')
				.setDescription(`React below to assign one of the following roles:\n\n${embedRoleList}`);
			message.channel.send({ embed: roleMenuEmbed }).then(async (reactEmbed) => {
				db.prepare(`UPDATE rolemenu SET activeRoleMenuID = ${reactEmbed.id} WHERE guildid = ${message.guild.id}`).run();
				for (i = 0; i < roleArray.length; i++) {
					await reactEmbed.react(alphaEmoji[i]);
				}
			});
		}
	}

};
