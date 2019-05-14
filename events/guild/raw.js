/* eslint-disable no-shadow */
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = async (bot, event) => {
	const eventType = event.t;
	const data = event.d;
	if (eventType == 'MESSAGE_DELETE') {
		if (data.user_id == bot.user.id) return;
		const getRoleMenu = db
			.prepare(`SELECT * FROM rolemenu WHERE guildid=${data.guild_id}`)
			.get();
		if (!getRoleMenu || !getRoleMenu.activeRoleMenuID) {
			return;
		}
		else if (getRoleMenu.activeRoleMenuID === data.id) {
			db.prepare(
				`UPDATE rolemenu SET activeRoleMenuID = '' WHERE guildid = ${
					data.guild_id
				}`
			).run();
		}
	}
	if (eventType === 'MESSAGE_REACTION_ADD') {
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
			'🇿',
		];
		if (data.user_id == bot.user.id) return;
		const guild = bot.guilds.find(guild => guild.id === data.guild_id);
		const member = guild.members.find(member => member.id === data.user_id);
		const foundRoleMenu = db
			.prepare(`SELECT * FROM rolemenu WHERE guildid=${data.guild_id}`)
			.get();
		if (!foundRoleMenu) {
			return;
		}
		else if (foundRoleMenu.activeRoleMenuID === data.message_id) {
			const channel = guild.channels.find(
				channel => channel.id === data.channel_id
			);
			channel.fetchMessage(foundRoleMenu.activeRoleMenuID).then(msg => {
				const roleArray = JSON.parse(foundRoleMenu.roleList);
				const reaction =
					msg.reactions.get(data.emoji.name) ||
					msg.reactions.get(data.emoji.name + ':' + data.emoji.id);
				if (member.id !== bot.user.id) {
					if (alphaEmoji.includes(data.emoji.name)) {
						const roleIndex = alphaEmoji.indexOf(data.emoji.name);
						const addedRole = msg.guild.roles.find(
							r => r.id === roleArray[roleIndex]
						);
						const memberRole = member.roles.map(role => role.id);

						if (
							!member.hasPermission('MANAGE_MESSAGES') &&
							addedRole.hasPermission('MANAGE_MESSAGES')
						) {
							const getReactUser = reaction.users.map(react => react.id);
							if (getReactUser.includes(member.id)) {
								reaction.remove(member.id);
							}
							return;
						}
						else if (eventType === 'MESSAGE_REACTION_ADD') {
							if (memberRole.includes(roleArray[roleIndex])) {
								member.removeRole(roleArray[roleIndex]);
								reaction.remove(member.id);
							}
							else {
								member.addRole(roleArray[roleIndex]);
								reaction.remove(member.id);
							}
						}
					}
					else {
						reaction.remove(member.id);
					}
				}
			});
		}
	}
};
