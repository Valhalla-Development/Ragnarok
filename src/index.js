import RagnarokClient from './Structures/RagnarokClient.js';

import 'dotenv/config';

const config = process.env;

const client = new RagnarokClient(config);
client.start();
