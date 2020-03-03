/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const { readdirSync } = require('fs');

module.exports = (bot) => {
  const load = (dirs) => {
    const commands = readdirSync(`./commands/${dirs}/`).filter((d) => d.endsWith('.js'));
    for (const file of commands) {
      const pull = require(`../commands/${dirs}/${file}`);
      bot.commands.set(pull.config.name, pull);
      if (pull.config.aliases) { pull.config.aliases.forEach((a) => bot.aliases.set(a, pull.config.name)); }
    }
  };
  [
    'fun',
    'generators',
    'hidden',
    'informative',
    'moderation',
    'music',
    'owner',
    'ticket',
  ].forEach((x) => load(x));
};
