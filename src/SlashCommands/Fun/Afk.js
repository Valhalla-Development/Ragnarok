import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import SQLite from 'better-sqlite3';
import SlashCommand from '../../Structures/SlashCommand.js';

const db = new SQLite('./Storage/DB/db.sqlite');

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
    const afkGrab = db.prepare('SELECT * FROM afk WHERE id = ?').get(`${interaction.user.id}-${interaction.guild.id}`);

    const reason = interaction.options.getString('reason') || 'AFK';

    if (afkGrab) {
      await db.prepare('UPDATE afk SET reason = (@reason) WHERE (user, guildid, id) = (@user, @guildid, @id);').run({
        reason,
        user: interaction.user.id,
        guildid: interaction.guild.id,
        id: `${interaction.user.id}-${interaction.guild.id}`
      });
    } else {
      await db.prepare('INSERT INTO afk (reason, user, guildid, id) values (@reason, @user, @guildid, @id);').run({
        reason,
        user: interaction.user.id,
        guildid: interaction.guild.id,
        id: `${interaction.user.id}-${interaction.guild.id}`
      });
    }

    const badChannel = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
      name: `**${this.client.user.username} - AFK**`,
      value: `**◎ Success:** ${interaction.user} is now AFK for the following reason:\n\n${reason}`
    });
    interaction.reply({ embeds: [badChannel] });
  }
};

export default SlashCommandF;
