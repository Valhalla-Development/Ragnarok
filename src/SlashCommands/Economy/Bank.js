import { EmbedBuilder } from 'discord.js';
import SlashCommand from '../../Structures/SlashCommand.js';
import Balance from '../../Mongo/Schemas/Balance.js';

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Banks specified amount of money',
      category: 'Economy'
    });
  }

  async run(interaction) {
    const balance = await Balance.findOne({ IdJoined: `${interaction.user.id}-${interaction.guild.id}` });

    if (balance.Cash === 0) {
      const limitE = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Bank**`, value: '**◎ Error:** You do not have any Cash to deposit!' });
      interaction.reply({ ephemeral: true, embeds: [limitE] });
      return;
    }

    const bankCalc = balance.Cash + balance.Bank;

    const depAll = new EmbedBuilder()
      .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
      .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
      .setThumbnail('attachment://Bank.png')
      .addFields({
        name: `**${this.client.user.username} - Bank**`,
        value: `**◎ Success:** You have deposited <:coin:706659001164628008> \`${balance.Cash.toLocaleString('en')}\` to your Bank.`
      });
    interaction.reply({ embeds: [depAll], files: ['./Storage/Images/Economy/Bank.png'] });

    balance.Cash = 0;
    balance.Bank = bankCalc;
    balance.Total = bankCalc;

    await balance.save();
  }
};

export default SlashCommandF;
