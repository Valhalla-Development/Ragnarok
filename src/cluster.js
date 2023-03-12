import { ClusterManager } from 'discord-hybrid-sharding';
import url from 'url';
import 'dotenv/config';
import DSU from '@dbd-soft-ui/shards';

const config = process.env;

const directory = url.fileURLToPath(new URL('..', import.meta.url));
const manager = new ClusterManager(`${directory}src/index.js`, {
  totalShards: 1, // 4,
  shardsPerClusters: 1, // 4,
  totalClusters: 1,
  mode: 'process',
  token: config.TOKEN
});

manager.on('clusterCreate', (cluster) => console.log(`Launched Cluster ${cluster.id}`));
await manager.spawn({ timeout: -1 });

DSU.register(manager, {
  dashboard_url: config.DBD_DOMAIN,
  key: 'MXhqpCz5ACLYJ7c5',
  interval: 15
});
