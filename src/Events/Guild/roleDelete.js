const Event = require('../../Structures/Event');
const { EmbedBuilder, MessageActionRow, MessageButton } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Event {

	async run(role) {
		function checkRoleMenu(clientGrab) {
			const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(role.guild.id);
			const { prefix } = prefixgrab;

			const foundRoleMenu = db.prepare(`SELECT * FROM rolemenu WHERE guildid=${role.guild.id}`).get();
			if (!foundRoleMenu || !foundRoleMenu.roleList || !foundRoleMenu.roleList.length) return;

			const roleArray = JSON.parse(foundRoleMenu.roleList);

			if (roleArray.includes(role.id)) {
				roleArray.splice(roleArray.indexOf(role.id), 1);

				const updateRoleMenu = db.prepare(`UPDATE rolemenu SET roleList = (@roleList) WHERE guildid=${role.guild.id}`);
				updateRoleMenu.run({
					roleList: JSON.stringify(roleArray)
				});

				// Update rolemenu if exists
				if (foundRoleMenu.activeRoleMenuID) {
					const activeMenu = JSON.parse(foundRoleMenu.activeRoleMenuID);

					if (activeMenu) {
						const ch = role.guild.channels.cache.get(activeMenu.channel);

						try {
							ch.messages.fetch(activeMenu.message).then(ms => {
								const row = new MessageActionRow();

								for (const buttonObject of roleArray) {
									const currentRoles = role.guild.roles.cache.get(buttonObject);

									row.addComponents(
										new MessageButton()
											.setCustomId(`rm-${currentRoles.id}`)
											.setLabel(`${currentRoles.name}`)
											.setStyle('SUCCESS')
									);
								}

								setTimeout(() => {
									// I added this timeout because I couldn’t be bothered fixing, please don’t remove or I cry
									const roleMenuEmbed = new EmbedBuilder()
										.setColor(clientGrab.utils.color(role.guild.me.displayHexColor))
										.setTitle('Assign a Role')
										.setDescription(`Select the role you wish to assign to yourself.`);
									ms.edit({ embeds: [roleMenuEmbed], components: [row] });
								});
							}, 1000);
						} catch {
							const embed = new EmbedBuilder()
								.setColor(clientGrab.utils.color(role.guild.me.displayHexColor))
								.addField(`**${clientGrab.user.username} - Config**`,
									`**◎ Error:** A role in the role menu was deleted, I was unable to update the active role menu. Please run the following command to refresh it.\n\`${prefix}rolemenu\``);
							ch.send({ embeds: [embed] }).then((m) => clientGrab.utils.deletableCheck(m, 10000));
						}
					}
				}
			}
		}
		checkRoleMenu(this.client);

		const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${role.guild.id};`).get();
		if (!id) return;

		const logs = id.channel;
		if (!logs) return;

		const logembed = new EmbedBuilder()
			.setAuthor({ name: `${role.guild.name}`, iconURL: role.guild.iconURL() })
			.setDescription(`**◎ Role Deleted: \`${role.name}\`.**`)
			.setColor(this.client.utils.color(role.guild.me.displayHexColor))
			.setTimestamp();
		this.client.channels.cache.get(logs).send({ embeds: [logembed] });
	}

};
