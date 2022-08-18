import { EmbedBuilder } from 'discord.js';
import Command from '../../Structures/Command.js';

export const CommandF = class extends Command {
  constructor(...args) {
    super(...args, {
      description: 'Reloads specified command.',
      aliases: ['rl'],
      category: 'Hidden',
      ownerOnly: true
    });
  }

  async run(message, args) {
    this.client.utils.messageDelete(message, 10000);

    const noBOI = new EmbedBuilder()
      .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
      .addFields({ name: `**${this.client.user.username} - Reload**`, value: `${message.author} ARE YOU DUMB?! RELOAD DOES NOT WORK IN ESM BRUH` });
    message.channel.send({ embeds: [noBOI] }).then((m) => this.client.utils.deletableCheck(m, 10000));
    return;

    const cmd = args[0];
    if (!cmd) {
      this.client.utils.messageDelete(message, 10000);

      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Reload**`, value: '**◎ Error:** Please specify a command to reload!' });
      message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    const command = this.client.commands.get(cmd) || this.client.commands.get(this.client.aliases.get(cmd));

    if (!command) {
      this.client.utils.messageDelete(message, 10000);

      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Reload**`, value: `**◎ Error:** Could not find command name \`${cmd}\`` });
      message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
      .addFields({ name: `**${this.client.user.username} - Reload**`, value: `**◎ Success:** Realoading \`${command.name}\`` });
    message.channel.send({ embeds: [embed] }).then(async (m) => {
      const startRestart = new Date();

      const File = await import(`../${command.category}/${ucFirst(command.name)}.js`);
      const CommandCre = new File(this.client, command.name.toLowerCase());

      this.client.commands.delete(command.name);
      await this.client.commands.set(command.name, CommandCre);

      const endRestart = new Date();

      const timeInMs = endRestart.getTime() - startRestart.getTime();

      const embedUpd = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
        name: `**${this.client.user.username} - Reload**`,
        value: `**◎ Success:** Command **${command.name}** has been successfully reloaded!\nCommand took \`${timeInMs}\`ms to reload.`
      });
      m.edit({ embeds: [embedUpd] });
    });

    function ucFirst(str) {
      if (!str) return str;
      return str[0].toUpperCase() + str.slice(1);
    }
  }
};

export default CommandF;
