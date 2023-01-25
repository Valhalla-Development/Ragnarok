import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import SlashCommand from '../../Structures/SlashCommand.js';
import AFK from '../../Mongo/Schemas/AFK.js';

const data = new SlashCommandBuilder()
  .setName('afk')
  .setDescription('Sets your AFK status')
  .addStringOption((option) => option.setName('reason').setDescription('The reason you are going AFK').setRequired(true).setMaxLength(100));

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Sets your AFK status',
      category: 'Fun',
      options: data
    });
  }

  async run(interaction) {
    const reason = interaction.options.getString('reason') || 'AFK';

    const afk = await AFK.findOne({ IdJoined: `${interaction.user.id}-${interaction.guild.id}` });

    if (!afk) {
      await new AFK({
        IdJoined: `${interaction.user.id}-${interaction.guild.id}`,
        GuildId: interaction.guild.id,
        UserId: interaction.user.id,
        Reason: reason
      }).save();
    } else {
      await AFK.findOneAndUpdate(
        {
          IdJoined: `${interaction.user.id}-${interaction.guild.id}`
        },
        {
          Reason: reason
        }
      );
    }

    const badChannel = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
      name: `**${this.client.user.username} - AFK**`,
      value: `**◎ Success:** ${interaction.user} is now AFK for the following reason:\n\n${reason}`
    });
    interaction.reply({ embeds: [badChannel] });
  }
};

export default SlashCommandF;
