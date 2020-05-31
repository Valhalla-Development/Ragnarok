const RagnarokClient = require('./Structures/RagnarokClient');
const config = require('../config.json');

const client = new RagnarokClient(config);
client.start();
