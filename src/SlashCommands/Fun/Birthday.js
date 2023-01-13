/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-expressions */
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import moment from 'moment';
import mongoose from 'mongoose';
import ms from 'ms';
import Birthdays from '../../Mongo/Schemas/Birthdays.js';
import BirthdayConfig from '../../Mongo/Schemas/BirthdayConfig.js';

import SlashCommand from '../../Structures/SlashCommand.js';

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
  .addSubcommand((subcommand) => subcommand.setName('delete').setDescription('Deletes your birthday'))
  .addSubcommand((subcommand) => subcommand.setName('list').setDescription('View all birthdays in the server'));

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

    const birthdayConfigDB = await BirthdayConfig.findOne({ guildId: interaction.guild.id });

    if (args === 'view') {
      const user = interaction.options.getMember('user');

      const birthdayDB = await Birthdays.findOne({ userId: user.id });

      if (!birthdayConfigDB && birthdayDB) {
        let year;

        const bdayNow = moment();
        const nextBirthday = birthdayDB.date.slice(0, birthdayDB.date.length - 4);

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
        const nextBirthday = birthdayDB.date.slice(0, birthdayDB.date.length - 4);

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

    const birthdayDB = await Birthdays.findOne({ userId: interaction.user.id });

    if (args === 'delete') {
      if (!birthdayDB) {
        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Birthday**`, value: '**◎ Error:** I could not find your birthday in the database!' });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      await birthdayDB.deleteOne({ userId: interaction.user.id }); //!

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
        await Birthdays.findOneAndUpdate(
          {
            userId: interaction.user.id
          },
          {
            date: argsDate,
            lastRun: null
          }
        );
      } else {
        await new Birthdays({
          userId: interaction.user.id,
          date: argsDate,
          lastRun: null
        }).save();
      }
    }

    if (args === 'list') {
      // Fetch all of the birthdays from the database
      const rows = await Birthdays.find();

      // Filter the rows to only include users who are in the guild
      const filteredRows = rows.filter((row) => {
        const member = interaction.guild.members.cache.get(row.userId);
        return member;
      });

      if (!rows) {
        const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Birthday**`,
          value: '**◎ Error:** No users have a birthday defined within this guild'
        });
        interaction.reply({ ephemeral: true, embeds: [embed] }); //! TEST
        return;
      }

      // sort the birthdays by the number of days until each one
      const sortedRows = filteredRows.sort((a, b) => {
        const today = moment();

        // parse the birthday strings into moment objects
        const momentA = moment(a.date.substring(0, a.date.length - 5), 'MM/DD');
        const momentB = moment(b.date.substring(0, b.date.length - 5), 'MM/DD');

        // if either birthday has already passed this year, add one year to the moment object so we compare the correct dates
        if (momentA.isBefore(today)) {
          momentA.add(1, 'year');
        }
        if (momentB.isBefore(today)) {
          momentB.add(1, 'year');
        }

        // return the difference in days between the two moment objects
        return momentA.diff(momentB, 'days');
      });

      // Create a paginated list of users and their birthdays
      const itemsPerPage = 10;
      const pages = [];
      for (let i = 0; i < sortedRows.length; i += itemsPerPage) {
        pages.push(sortedRows.slice(i, i + itemsPerPage));
      }

      // Create an embed for each page
      const embeds = [];
      for (let i = 0; i < pages.length; i++) {
        // Create a new embed
        const embed = new EmbedBuilder()
          .setAuthor({ name: `Birthdays for ${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ extension: 'png' }) })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor));
        // Add fields to the embed
        embed.addFields(
          {
            name: 'User',
            value: pages[i]
              .map((row) => {
                const member = interaction.guild.members.cache.get(row.userId);
                return member.toString();
              })
              .join('\n'),
            inline: true
          },
          {
            name: 'Date',
            value: pages[i]
              .map((row) => {
                const date = moment(row.date, 'MM/DD/YYYY').format('Do MMMM');
                return `\`${date}\``;
              })
              .join('\n'),
            inline: true
          },
          {
            name: 'In',
            value: pages[i]
              .map((row) => {
                let year;

                const bdayNow = moment();
                const nextBirthday = row.date.slice(0, row.date.length - 4);

                const birthdayNext = new Date(nextBirthday + bdayNow.year());
                const getNow = new Date();
                if (birthdayNext > getNow) {
                  year = bdayNow.year();
                } else {
                  year = bdayNow.year() + 1;
                }

                const then = moment(nextBirthday + year, 'MM/DD/YYYY');
                return `\`${ms(then - bdayNow, { long: true })}\``;
              })
              .join('\n'),
            inline: true
          }
        );

        if (pages.length > 1) {
          embed.setFooter({ text: `Page ${i + 1}/${pages.length}` });
        }
        // Add the embed to the list
        embeds.push(embed);
      }

      // Send the paginated list to the channel
      if (embeds.length > 1) {
        this.client.functions.pagination(interaction, embeds);
      } else {
        interaction.reply({ embeds: [embeds[0]] });
      }
    }
  }
};

export default SlashCommandF;
