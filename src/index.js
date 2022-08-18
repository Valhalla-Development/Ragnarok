import RagnarokClient from './Structures/RagnarokClient.js';

import * as config from '../config.json' assert { type: 'json' };

const client = new RagnarokClient(config.default);
client.start();
