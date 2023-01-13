import { EmbedBuilder, AttachmentBuilder, ActivityType } from 'discord.js';
import Canvas from 'canvas';
import ordinal from 'ordinal';
import fetch from 'node-fetch';
import Event from '../../Structures/Event.js';
import Tickets from '../../Mongo/Schemas/Tickets.js';
import Welcome from '../../Mongo/Schemas/Welcome.js';
import AutoRole from '../../Mongo/Schemas/AutoRole.js';
import Logging from '../../Mongo/Schemas/Logging.js';

Canvas.registerFont('./Storage/Canvas/Fonts/Handlee-Regular.ttf', {
  family: 'Handlee'
});

Canvas.registerFont('./Storage/Canvas/Fonts/Montserrat-SemiBold.ttf', {
  family: 'Montserrat'
});

export const EventF = class extends Event {
  async run(member) {
    this.client.user.setActivity(
      `/help | ${this.client.guilds.cache.size.toLocaleString('en')} Guilds ${this.client.guilds.cache
        .reduce((a, b) => a + b.memberCount, 0)
        .toLocaleString('en')} Users`,
      {
        type: ActivityType.Watching
      }
    );

    async function checkTicket(client) {
      // Check if the user has a ticket
      const foundTicket = await Tickets.findOne({ guildId: member.guild.id, authorId: member.user.id });
      if (foundTicket) {
        // Fetch the channel
        const channel = member.guild.channels.cache.get(foundTicket.get({ authorid: member.user.id }).chanid);

        // Check if the channel exists
        if (channel) {
          // Send a message that the user joined
          channel.permissionOverwrites
            .create(member, {
              VIEW_CHANNEL: true,
              SEND_MESSAGES: true
            })
            .catch(console.error);
          const embed = new EmbedBuilder().setColor(client.utils.color(member.guild.members.me.displayHexColor)).addFields({
            name: `**${client.user.username} - Ticket**`,
            value: `**◎:** \`${member.user.tag}\` has rejoined the server\nThey have been added back to the ticket.`
          });
          channel.send({ embeds: [embed] });
        }
      }
    }
    checkTicket(this.client);

    // welcome
    async function welcomeMessage(clientGrab) {
      // Return if user is my testing alt
      // if (member.user.id === '488717256897855519') return;

      const setwelcome = await Welcome.findOne({ guildId: member.guild.id });
      if (!setwelcome) return;

      const sendchannel = setwelcome.channel;
      const chnsen = member.guild.channels.cache.find((channel) => channel.id === sendchannel);

      if (!chnsen) {
        await Welcome.deleteMany({ guildId: member.guild.id });
        return;
      }

      let img;
      if (setwelcome.image) {
        await fetch(setwelcome.image).then((res) => {
          if (res.ok) {
            img = setwelcome.image;
          } else {
            img = './Storage/Canvas/Images/welcome.jpg';
          }
        });
      } else {
        img = './Storage/Canvas/Images/welcome.jpg';
      }

      const canvas = Canvas.createCanvas(700, 300);
      const ctx = canvas.getContext('2d');

      const background = await Canvas.loadImage(img);

      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      // bars
      ctx.globalAlpha = 0.75;

      ctx.rect(-1, 7, 702, 52);
      ctx.rect(-1, 240, 702, 52);
      ctx.fillStyle = '#000000';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.globalAlpha = 1;

      // text
      ctx.font = '42px Handlee';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('Welcome to the server', canvas.width / 2, 45);

      ctx.font = '42px Handlee';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(`${member.user.username}`, canvas.width / 2, 280);

      ctx.font = '15px Montserrat';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(`${ordinal(member.guild.memberCount - member.guild.members.cache.filter((m) => m.user.bot).size)} member!`, 3.5, 45);

      ctx.beginPath();
      ctx.arc(350, 150, 85, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();

      const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ extension: 'png' }));

      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(avatar, 257.5, 57.5, 180, 180);

      const attachment = new AttachmentBuilder(canvas.toBuffer(), {
        name: 'welcome.jpg'
      });

      clientGrab.channels.cache
        .get(sendchannel)
        .send({ files: [attachment] })
        .catch((err) => console.error(err));
    }
    welcomeMessage(this.client);

    // autorole
    async function autoRole() {
      const autoroletable = await AutoRole.findOne({ guildId: member.guild.id });
      if (!autoroletable) return;

      const autorole = autoroletable.role;
      if (!autorole) return;

      const myRole = member.guild.roles.cache.find((role) => role.id === autorole);
      if (!myRole) return;

      const botHasPermission = member.guild.members.me.permissions.has('ManageRoles');
      if (!botHasPermission) {
        await AutoRole.deleteMany({ guildId: member.guild.id });
        return;
      }

      member.roles.add(myRole);
    }
    autoRole();

    // Logs
    async function logging(grabClient) {
      const id = await Logging.findOne({ guildId: member.guild.id });
      if (!id) return;

      const logs = id.channel;
      if (!logs) return;

      const logembed = new EmbedBuilder()
        .setColor(grabClient.utils.color(member.guild.members.me.displayHexColor))
        .setAuthor({
          name: `${member.guild.name}`,
          iconURL: member.user.avatarURL()
        })
        .setDescription(
          `**◎ Member Joined:** ${member.user} - \`${member.user.tag}\` - \`(${member.user.id})\`\n**◎ Account Created:** <t:${Math.round(
            member.user.createdTimestamp / 1000
          )}> - (<t:${Math.round(member.user.createdTimestamp / 1000)}:R>)\n**◎ Joined:** <t:${Math.round(
            member.joinedTimestamp / 1000
          )}> - (<t:${Math.round(member.joinedTimestamp / 1000)}:R>)`
        )
        .setFooter({ text: `ID: ${member.user.id}` })
        .setTimestamp();
      grabClient.channels.cache.get(logs).send({ embeds: [logembed] });
    }
    logging(this.client);
  }
};

export default EventF;
