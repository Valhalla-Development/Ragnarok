module.exports = class sudo {

	constructor(client) {
		this.client = client;
	}

	async sudo(message, text, user) {
		message.channel.createWebhook(user.user.username, { avatar: user.user.displayAvatarURL({ dynamic: true }) }).then(webhook => {
			webhook.send(text);
			setTimeout(() => {
				webhook.delete();
			}, 3000);
		});
	}


};
