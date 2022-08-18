import Command from '../../Structures/Command.js';

export const CommandF = class extends Command {
  constructor(...args) {
    super(...args, {
      description: 'Displays an invite link to the bots support server.',
      category: 'Informative',
      botPerms: ['EmbedLinks']
    });
  }

  async run(message) {
    message.channel.send({ content: '**◎ Support Server Invite**: https://discord.gg/Q3ZhdRJ' });
  }
};

export default CommandF;
