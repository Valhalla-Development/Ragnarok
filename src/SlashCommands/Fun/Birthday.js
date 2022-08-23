import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import SQLite from 'better-sqlite3';
import moment from 'moment';
import ms from 'ms';

import SlashCommand from '../../Structures/SlashCommand.js';

const db = new SQLite('./Storage/DB/db.sqlite');

const data = new SlashCommandBuilder()
  .setName('birthday')
  .setDescription('The ability to set your birthday')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('view')
      .setDescription('View birthday of a user')
      .addUserOption((option) => option.setName('user').setDescription('The user').setRequired(true))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('set')
      .setDescription('Sets your birthday')
      .addStringOption((option) => option.setName('date').setDescription('Sets your birthday, format: MM/DD/YYYY').setRequired(true))
  )
  .addSubcommand((subcommand) => subcommand.setName('delete').setDescription('Deletes your birthday'));

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'The ability to set your birthday',
      category: 'Fun',
      options: data
    });
  }

  async run(interaction) {
    const args = interaction.options.getSubcommand();

    const birthdayConfigDB = db.prepare(`SELECT * FROM birthdayConfig WHERE guildid = ${interaction.guild.id};`).get();

    if (args === 'view') {
      const user = interaction.options.getMember('user');

      const birthdayDB = db.prepare(`SELECT * FROM birthdays WHERE userid = ${user.id};`).get();

      if (!birthdayConfigDB && birthdayDB) {
        let year;

        const bdayNow = moment();
        const nextBirthday = birthdayDB.birthday.slice(0, birthdayDB.birthday.length - 4);

        const birthdayNext = new Date(nextBirthday + bdayNow.year());
        const getNow = new Date();
        if (birthdayNext > getNow) {
          year = bdayNow.year();
        } else {
          year = bdayNow.year() + 1;
        }

        const then = moment(nextBirthday + year, 'MM/DD/YYYY');

        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Birthday**`,
            value: `**◎** ${user}'s **next** birthday is in **${ms(then - bdayNow, { long: true })}**, on **${nextBirthday + year}**`
          })
          .setFooter({ text: 'This server currently has this feature disabled, you will not receive an alert in this server.' });
        interaction.reply({ embeds: [embed] });
        return;
      }

      if (!birthdayConfigDB) {
        const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Birthday**`,
          value:
            '**◎ Error:** Birthdays are currently disabled on this server, an admin may need to enable this function.\nThey can do this by running `/config birthday`'
        });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      if (!birthdayDB) {
        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Birthday**`, value: `**◎** ${user} does not have a birthday set!` });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      if (birthdayDB) {
        let year;

        const bdayNow = moment();
        const nextBirthday = birthdayDB.birthday.slice(0, birthdayDB.birthday.length - 4);

        const birthdayNext = new Date(nextBirthday + bdayNow.year());
        const getNow = new Date();
        if (birthdayNext > getNow) {
          year = bdayNow.year();
        } else {
          year = bdayNow.year() + 1;
        }

        const then = moment(nextBirthday + year, 'MM/DD/YYYY');

        const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Birthday**`,
          value: `**◎** ${user}'s **next** birthday is in **${ms(then - bdayNow, { long: true })}**, on **${nextBirthday + year}**`
        });
        interaction.reply({ embeds: [embed] });
        return;
      }
    }

    const birthdayDB = db.prepare(`SELECT * FROM birthdays WHERE userid = ${interaction.user.id};`).get();

    if (args === 'delete') {
      if (!birthdayDB) {
        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Birthday**`, value: '**◎ Error:** I could not find your birthday in the database!' });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      await db.prepare('DELETE FROM birthdays WHERE userid = ?').run(interaction.user.id);

      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Birthday**`, value: '**◎ Success:** I have removed your birthday from the database!' });
      interaction.reply({ ephemeral: true, embeds: [embed] });
      return;
    }

    if (args === 'set') {
      const argsDate = interaction.options.getString('date');

      const validateDate = moment(argsDate, 'MM/DD/YYYY', true).isValid();

      if (!validateDate) {
        const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Birthday**`,
          value: '**◎ Error:** Please input a valid date! Input should be `MM/DD/YYYY`\nAn example would be:\n`12/31/2002`'
        });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      const birthdayUpd = new Date(argsDate);
      const now = new Date();

      if (birthdayUpd > now) {
        const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Birthday**`,
          value: `**◎ Error:** You tried to set your birthday to: \`${argsDate}\` ... that date is in the future <:wut:745408596233289839>`
        });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
        name: `**${this.client.user.username} - Birthday**`,
        value: `**◎ Success:** You have successfully set your birthday to \`${argsDate}\``
      });
      interaction.reply({ ephemeral: true, embeds: [embed] });

      if (birthdayDB) {
        await db.prepare('UPDATE birthdays SET birthday = (@birthday), lastRun = (@lastRun) WHERE userid = (@userid);').run({
          userid: interaction.user.id,
          birthday: argsDate,
          lastRun: null
        });
      } else {
        const insert = db.prepare('INSERT INTO birthdays (userid, birthday, lastRun) VALUES (@userid, @birthday, @lastRun);');
        insert.run({
          userid: interaction.user.id,
          birthday: argsDate,
          lastRun: null
        });
      }
    }
  }
};

export default SlashCommandF;
