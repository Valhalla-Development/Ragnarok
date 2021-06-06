const Event = require('../../Structures/Event');

module.exports = class extends Event {

	async run(button) {
		await button.defer().catch(error => {
			this.client.logger.error(error);
		});
	}

};
