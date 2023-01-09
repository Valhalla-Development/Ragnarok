export default {
  name: 'disconnected',
  run(err) {
    console.log(`\x1b[31m[Database Status]: An error occured with the Mongo connection:\n${err}\x1b[0m`);
  }
};
