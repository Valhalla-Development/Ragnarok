import { ButtonBuilder, ActionRowBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import SlashCommand from '../../Structures/SlashCommand.js';

const data = new SlashCommandBuilder()
  .setName('suggest')
  .setDescription('Used to create a suggestion or bug report for the bot')
  .addStringOption((option) => option.setName('input').setDescription('Suggestion or bug to report').setRequired(true));

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Used to create a suggestion or bug report for the bot',
      category: 'Informative',
      options: data
    });
  }

  async run(interaction) {
    const sArgs = interaction.options.getString('input');

    const buttonA = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Yes').setCustomId('yes');
    const buttonB = new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel('No').setCustomId('no');

    const row = new ActionRowBuilder().addComponents(buttonA, buttonB);

    const questionE = new EmbedBuilder()
      .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
      .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
      .addFields({
        name: `**${this.client.user.username} - Suggest**`,
        value: `**◎ NOTE** This is a **${this.client.user}** suggestion/bug report, not a **SERVER** suggestion/bug.\nThis message will be forwarded to the bot owner.\n\n**◎ Are you sure you want to send this suggestion?**`
      });

    const m = await interaction.reply({ components: [row], embeds: [questionE] });

    const filter = (but) => but.user.id !== this.client.user.id;

    const collector = m.createMessageComponentCollector({ filter, time: 15000 });

    collector.on('collect', async (b) => {
      collector.resetTimer();

      if (b.customId === 'yes') {
        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(this.client.guilds.cache.get(this.client.config.supportGuild).me.displayHexColor))
          .setTitle('Suggestion')
          .setDescription(`**◎ User: <@${interaction.user.id}> - **\`${interaction.user.tag}\`\n**Suggestion:** ${sArgs}`)
          .setFooter({ text: `${interaction.guild.name} - ${interaction.guild.id}` });
        this.client.guilds.cache
          .get(this.client.config.supportGuild)
          .channels.cache.get(this.client.config.suggestChan)
          .send({ embeds: [embed] });

        const loggedEmbed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Suggest**`, value: '**◎ Success:** Suggestion/bug has been successfully sent!' });
        interaction.followUp({ embeds: [loggedEmbed] });
      }
      if (b.customId === 'no') {
        interaction.deleteReply();
      }
    });

    collector.on('end', (_, reason) => {
      if (reason === 'time') {
        interaction.deleteReply();
      }
    });
  }
};

export default SlashCommandF;
