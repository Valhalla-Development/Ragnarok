import { ClusterClient } from 'discord-hybrid-sharding';
import RagnarokClient from './Structures/RagnarokClient.js';
import 'dotenv/config';

const config = process.env;

const client = new RagnarokClient(config);
client.cluster = new ClusterClient(client);
await client.start();
