import { EmbedBuilder } from 'discord.js';
import SlashCommand from '../../Structures/SlashCommand.js';

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Clones the channel and deletes the original.',
      category: 'Moderation'
    });
  }

  async run(interaction) {
    // Disable for AirReps server
    if (interaction.guild.id === '657235952116170794') {
      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Nuke**`, value: '**◎ Error:** This command has been disabled for this server!' });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    const { channel } = interaction;

    await channel.clone({ name: `${channel.name}`, reason: 'Nuked!' }).then((chn) => {
      channel.delete();
      chn.setParent(channel.parentId);
      chn.setPosition(channel.rawPosition);
      chn.send({ content: 'Channel has been nuked!\nhttps://tenor.com/view/explosion-mushroom-cloud-atomic-bomb-bomb-boom-gif-4464831' });
    });
  }
};

export default SlashCommandF;
