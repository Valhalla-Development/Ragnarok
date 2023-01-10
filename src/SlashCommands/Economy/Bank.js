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
    const balance = await Balance.findOne({ idJoined: `${interaction.user.id}-${interaction.guild.id}` });

    if (balance.cash === 0) {
      const limitE = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Bank**`, value: '**◎ Error:** You do not have any cash to deposit!' });
      interaction.reply({ ephemeral: true, embeds: [limitE] });
      return;
    }

    const bankCalc = balance.cash + balance.bank;

    const depAll = new EmbedBuilder()
      .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
      .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
      .setThumbnail('attachment://Bank.png')
      .addFields({
        name: `**${this.client.user.username} - Bank**`,
        value: `**◎ Success:** You have deposited <:coin:706659001164628008> \`${balance.cash.toLocaleString('en')}\` to your bank.`
      });
    interaction.reply({ embeds: [depAll], files: ['./Storage/Images/Economy/Bank.png'] });

    balance.cash = 0;
    balance.bank = bankCalc;
    balance.total = bankCalc;

    await balance.save();
  }
};

export default SlashCommandF;
