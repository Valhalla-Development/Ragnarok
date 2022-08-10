const Command = require('../../Structures/Command');
const { EmbedBuilder, MessageButton, MessageActionRow } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Posts the role menu with pre-defiend roles.',
			category: 'Moderation',
			userPerms: ['ManageGuild'],
			botPerms: ['AddReactions']
		});
	}

	async run(message) {
		this.client.utils.messageDelete(message, 0);

		const foundRoleMenu = db.prepare(`SELECT * FROM rolemenu WHERE guildid=${message.guild.id}`).get();
		if (!foundRoleMenu || !foundRoleMenu.roleList || JSON.parse(foundRoleMenu.roleList).length <= 0) {
			const embed = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
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

			// Check if roles in the array exist in the server, if it does not, remove it from the array
			const roleArrayCleaned = roleArray.filter((role) => {
				if (message.guild.roles.cache.has(role)) {
					return true;
				} else {
					return false;
				}
			});

			// If there is no length to roleArrayCleaned, delete from database and send a message
			if (roleArrayCleaned.length <= 0) {
				const embed = new EmbedBuilder()
					.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
					.addField(`**${this.client.user.username} - RoleMenu**`,
						`**◎ Error:** The roles for the menu have been removed from the server. Please try again later.`);
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				db.prepare(`DELETE FROM rolemenu WHERE guildid=${message.guild.id}`).run();
				return;
			}

			const row = new MessageActionRow();

			for (const buttonObject of roleArrayCleaned) {
				const role = message.guild.roles.cache.get(buttonObject);

				row.addComponents(
					new MessageButton()
						.setCustomId(`rm-${role.id}`)
						.setLabel(`${role.name}`)
						.setStyle('SUCCESS')
				);
			}

			const roleMenuEmbed = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.setTitle('Assign a Role')
				.setDescription(`Select the role you wish to assign to yourself.`);
			message.channel.send({ embeds: [roleMenuEmbed], components: [row] }).then(async (reactEmbed) => {
				activeMenu.channel = message.channel.id;
				activeMenu.message = reactEmbed.id;

				db.prepare('UPDATE rolemenu SET activeRoleMenuID = (@activeRoleMenuID), roleList = (@roleList) WHERE guildid = (@guildid);').run({
					activeRoleMenuID: JSON.stringify(activeMenu),
					roleList: JSON.stringify(roleArrayCleaned),
					guildid: `${message.guild.id}`
				});
			});
		}
	}

};
