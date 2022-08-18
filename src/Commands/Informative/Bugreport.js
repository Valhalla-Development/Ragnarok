import { EmbedBuilder } from 'discord.js';
import Command from '../../Structures/Command.js';
import * as configFile from '../../../config.json' assert { type: 'json' };

const { supportGuild, supportChannel } = configFile.default;

export const CommandF = class extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ['bug'],
      description: 'Reports a bug on the bot to the owner.',
      category: 'Informative',
      usage: '<text>'
    });
  }

  async run(message, args) {
    if (!args[0]) {
      this.client.utils.messageDelete(message, 10000);

      const noinEmbed = new EmbedBuilder()
        .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - BugReport**`, value: '**◎ Error:** Please input some text!' });
      message.channel.send({ embeds: [noinEmbed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    const argresult = args.join(' ');

    const embed = new EmbedBuilder()
      .setColor(this.client.utils.color(this.client.guilds.cache.get(supportGuild).me.displayHexColor))
      .setTitle('Bug Report')
      .setDescription(`**◎ User: <@${message.author.id}> - **\`${message.author.tag}\`\n**Bug:** ${argresult}`)
      .setFooter({ text: `${message.guild.name} - ${message.guild.id}` });
    this.client.guilds.cache
      .get(supportGuild)
      .channels.cache.get(supportChannel)
      .send({ embeds: [embed] });

    this.client.utils.messageDelete(message, 10000);

    const loggedEmbed = new EmbedBuilder()
      .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
      .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
      .addFields({ name: `**${this.client.user.username} - BugReport**`, value: '**◎ Success:** Bug has been successfully reported!' });
    message.channel.send({ embeds: [loggedEmbed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
  }
};

export default CommandF;
