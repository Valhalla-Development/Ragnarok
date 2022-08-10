const Event = require('../../Structures/Event');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Event {

	async run(event) {
		const eventType = event.t;
		const data = event.d;

		async function ticketEmbed(grabClient) {
			if (eventType === 'MESSAGE_DELETE') {
				const channel = await grabClient.channels.cache.find(ch => ch.id === data.channel_id);

				if (channel.type === 'DM') return;

				if (data.user_id === grabClient.user.id) return;
				const getTicketEmbed = db.prepare(`SELECT * FROM ticketConfig WHERE guildid = ${data.guild_id}`).get();
				if (!getTicketEmbed || !getTicketEmbed.ticketembed) {
					return;
				}
				if (getTicketEmbed.ticketconfig === data.id) {
					db.prepare(`UPDATE ticketConfig SET ticketembed = '' WHERE guildid = ${data.guild_id}`).run();
				}
			}
		}
		ticketEmbed(this.client);
	}

};
