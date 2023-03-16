/* eslint-disable max-depth */
/* eslint-disable no-useless-escape */
import { EmbedBuilder, PermissionsBitField } from 'discord.js';
import StarBoard from '../../Mongo/Schemas/StarBoard.js';
import Event from '../../Structures/Event.js';

export const EventF = class extends Event {
  async run(messageReaction, user) {
    const grabMessage = messageReaction.message;
    const { channelId } = grabMessage;
    const msgId = grabMessage.id;

    // Fetch the channel
    const fetchChn = this.client.channels.cache.get(channelId);
    if (!fetchChn) return;

    // Fetch the message
    const message = await fetchChn.messages.fetch({ message: msgId });
    if (!message) return;

    // Starboard check
    const id = await StarBoard.findOne({ GuildId: message.guild.id });
    if (!id) return;

    const chn = id.ChannelId;
    if (!chn) return;

    if (id.ChannelId === null) {
      await StarBoard.deleteOne({ GuildId: message.guild.id });
      return;
    }

    if (!message.guild.channels.cache.find((channel) => channel.id === id.ChannelId)) {
      await StarBoard.deleteOne({ GuildId: message.guild.id });
      return;
    }

    // Define the starboard channel
    const starChannel = message.guild.channels.cache.find((channel) => channel.id === id.ChannelId);

    // Check if bot has perms to send messages in starboard channel
    if (!message.guild.members.me.permissionsIn(starChannel).has(PermissionsBitField.Flags.SendMessages)) {
      const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
        name: `**${this.client.user.username} - Starboard**`,
        value: '**◎ Error:** I am missing the permission `Send Messages` in the starboard channel.'
      });
      message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    if (messageReaction.emoji.name !== '⭐') return;

    if (message.author.id === user.id) {
      if (message.channel.id === starChannel.id) return;
      const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
        name: `**${this.client.user.username} - Starboard**`,
        value: `**◎ Error:** ${message.author}, You cannot star your own messages.`
      });
      message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      try {
        messageReaction.users.remove(messageReaction.message.author.id);
      } catch {
        // nothing ayy lmao
      }
      return;
    }

    // Here we fetch 100 messages from the starboard channel.
    const fetchedMessages = await starChannel.messages.fetch({ limit: 10 });

    // Check if the reaction was in the starboard channel
    if (message.channel.id === starChannel.id) {
      if (user.id !== this.client.user.id) {
        if (message && message.embeds[0]) {
          if (message.embeds[0].footer && message.embeds[0].footer.text.startsWith('⭐')) {
            // We fetch the ID of the message already on the starboard.
            const starMsg = await starChannel.messages.fetch(message.id);
            if (!starMsg) return;

            const foundStar = message.embeds[0];
            // Do some magic to get the fotter message id
            const getThatID = foundStar.footer.text;
            // Split that sum-bitch
            const dataArray = getThatID.split('|');
            const star = /^\⭐\s([0-9]{1,3})\s\|\s([0-9]{17,20})/.exec(foundStar.footer.text);
            const image = foundStar.image ? foundStar.image.url : '';
            const embed = new EmbedBuilder()
              .setColor(foundStar.color)
              .setThumbnail(foundStar.thumbnail.url)
              .addFields(foundStar.fields)
              .setTimestamp()
              .setFooter({
                text: `⭐ ${parseInt(star[1]) + 1} |${dataArray[1]}`
              });
            if (image) {
              embed.setImage(image);
            }
            // And now we edit the message with the new embed!
            await starMsg.edit({ embeds: [embed] });
          }
        }
      } else {
        return;
      }
      return;
    }

    // Filter only messages with an embed
    const filtered = fetchedMessages.filter((m) => m.embeds.length > 0);

    // We check the messages within the fetch object to see if the message that was reacted to is already a message in the starboard
    const stars = filtered.find(
      (m) => m.embeds[0].footer && m.embeds[0].footer.text.startsWith('⭐') && m.embeds[0].footer.text.endsWith(message.id)
    );

    // Now we setup an if statement for if the message is found within the starboard.
    if (stars) {
      // We fetch the ID of the message already on the starboard.
      const starMsg = await starChannel.messages.fetch({ message: stars.id });
      if (!starMsg) return;

      // Regex to check how many stars the embed has.
      const star = /^\⭐\s([0-9]{1,3})\s\|\s([0-9]{17,20})/.exec(stars.embeds[0].footer.text);
      // A variable that allows us to use the color of the pre-existing embed.
      const foundStar = stars.embeds[0];
      const image = foundStar.image ? foundStar.image.url : '';
      // Do some magic to get the fotter message id
      const getThatID = foundStar.footer.text;
      // Split that sum-bitch
      const dataArray = getThatID.split('|');
      const embed = new EmbedBuilder()
        .setColor(foundStar.color)
        .setThumbnail(foundStar.thumbnail.url)
        .addFields(foundStar.fields)
        .setTimestamp()
        .setFooter({ text: `⭐ ${parseInt(star[1]) + 1} |${dataArray[1]}` });
      if (image) {
        embed.setImage(image);
      }
      // We fetch the ID of the message already on the starboard.
      // And now we edit the message with the new embed!
      await starMsg.edit({ embeds: [embed] });
    } else {
      // We use the this.extension function to see if there is anything attached to the message.
      const image = message.attachments.size > 0 ? await this.extension(messageReaction, message.attachments.first().url) : '';
      // If the message is empty, we don't allow the user to star the message.
      if (image === '' && message.content.length < 1) {
        const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Starboard**`,
          value: '**◎ Error:** You cannot star an empty messages.'
        });
        message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
        return;
      }

      // We set the color to a nice yellow here.
      const embed = new EmbedBuilder()
        .setColor(15844367)
        .setThumbnail(message.author.displayAvatarURL({ extension: 'png' }))
        .addFields(
          { name: '**Author**', value: `${message.author}`, inline: true },
          {
            name: '**Channel**',
            value: `<#${message.channel.id}>`,
            inline: true
          },
          {
            name: '**Message**',
            value: `${message.content ? message.content : 'N/A'}`,
            inline: false
          },
          {
            name: '**Message:**',
            value: `[Jump To](${message.url})`,
            inline: false
          }
        )
        .setTimestamp(new Date())
        .setFooter({ text: `⭐ 1 | ${message.id}` });
      if (image) {
        embed.setImage(image);
      }
      await starChannel.send({ embeds: [embed] }).then((m) => m.react('⭐'));
    }
  }

  // Here we add the this.extension function to check if there's anything attached to the message.
  extension(messageReaction, attachment) {
    const imageLink = attachment.split('.');
    const typeOfImage = imageLink[imageLink.length - 1];
    const image = /(jpg|jpeg|png|gif)/gi.test(typeOfImage);
    if (!image) return '';
    return attachment;
  }
};

export default EventF;
