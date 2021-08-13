const Event = require('../../Structures/Event');

module.exports = class extends Event {

	async run(event) {
		this.client.manager.updateVoiceState(event);
	}

};
