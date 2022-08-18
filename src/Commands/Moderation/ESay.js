import { EmbedBuilder } from 'discord.js';
import Command from '../../Structures/Command.js';

export const CommandF = class extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ['embed'],
      description: 'Posts given input in an embed.',
      category: 'Moderation',
      usage: '<text>',
      userPerms: ['ManageGuild']
    });
  }

  async run(message, args) {
    this.client.utils.messageDelete(message, 0);

    if (args[0] === undefined) {
      this.client.utils.messageDelete(message, 10000);

      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - ESay**`, value: '**◎ Error:** You need to input text!' });
      message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    const sayMessage = args.join(' ');

    const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).setDescription(`${sayMessage}`);
    message.channel.send({ embeds: [embed] });
  }
};

export default CommandF;
