const Command = require('../../Structures/Command');
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

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

		if (!foundRoleMenu || !foundRoleMenu.roleList || JSON.parse(foundRoleMenu.roleList).length <= 0) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - RoleMenu**`,
					`**◎ Error:** The roles for the menu have not been set yet. Please try again later.`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			db.prepare(`DELETE FROM rolemenu WHERE guildid=${message.guild.id}`).run();
		} else {
			let activeMenu;
			if (!foundRoleMenu.activeRoleMenuID) {
				activeMenu = {};
			} else {
				activeMenu = JSON.parse(foundRoleMenu.activeRoleMenuID);
			}

			const roleArray = JSON.parse(foundRoleMenu.roleList);

			const menuArr = [];

			for (const buttonObject of roleArray) {
				const role = message.guild.roles.cache.get(buttonObject);
				menuArr.push(
					{
						label: `${role.name}`,
						description: `Click this to get the ${role.name} role!`,
						value: `${role.id}`
					}
				);
			}

			const dropdown = new MessageSelectMenu().addOptions(menuArr).setcustomId('rolemenu');

			const row = new MessageActionRow().addComponents(dropdown);

			const roleMenuEmbed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.setTitle('Assign a Role')
				.setDescription(`Select a role from the dropdown menu`);
			message.channel.send({ embeds: [roleMenuEmbed], components: [row] }).then(async (reactEmbed) => {
				activeMenu.channel = message.channel.id;
				activeMenu.message = reactEmbed.id;

				db.prepare('UPDATE rolemenu SET activeRoleMenuID = (@activeRoleMenuID) WHERE guildid = (@guildid);').run({
					activeRoleMenuID: JSON.stringify(activeMenu),
					guildid: `${message.guild.id}`
				});
			});
		}
	}

};
