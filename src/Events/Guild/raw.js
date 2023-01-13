import { ChannelType } from 'discord.js';
import Event from '../../Structures/Event.js';
import TicketConfig from '../../Mongo/Schemas/TicketConfig.js';

export const EventF = class extends Event {
  async run(event) {
    const eventType = event.t;
    const data = event.d;

    async function ticketEmbed(grabClient) {
      if (eventType === 'MESSAGE_DELETE') {
        const channel = await grabClient.channels.cache.find((ch) => ch.id === data.channel_id);

        if (channel.type === ChannelType.DM) return;

        if (data.user_id === grabClient.user.id) return;

        const getTicketEmbed = await TicketConfig.findOne({ guildId: data.guild_id });
        if (!getTicketEmbed || !getTicketEmbed.ticketembed) {
          return;
        }
        if (getTicketEmbed.ticketconfig === data.id) {
          await TicketConfig.findOneAndUpdate(
            {
              guildId: data.guild_id
            },
            {
              embed: null
            }
          );
        }
      }
    }
    ticketEmbed(this.client);
  }
};

export default EventF;
