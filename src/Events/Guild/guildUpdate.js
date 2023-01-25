import Event from '../../Structures/Event.js';
import Guilds from '../../Mongo/Schemas/Guilds.js';

export const EventF = class extends Event {
  async run(oldGuild, newGuild) {
    const update = {};
    if (oldGuild.name !== newGuild.name) {
      update.Name = newGuild.name;
    }
    if (oldGuild.iconURL() !== newGuild.iconURL()) {
      update.IconUrl = newGuild.iconURL();
    }
    if (Object.keys(update).length > 0) {
      await Guilds.findOneAndUpdate({ GuildId: newGuild.id }, update);
    }
  }
};

export default EventF;
