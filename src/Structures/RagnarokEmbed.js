import { EmbedBuilder } from 'discord.js';

export const RagnarokEmbed = class RagnarokEmbed extends EmbedBuilder {
  splitFields(title, content) {
    if (typeof title === 'undefined') return this; //! TEST THIS

    let contentToUse = content;
    let titleToUse = title;
    if (typeof contentToUse === 'undefined') {
      contentToUse = title;
      titleToUse = '\u200B';
    } else {
      titleToUse = title;
    }

    if (Array.isArray(contentToUse)) contentToUse = contentToUse.join('\n');
    if (titleToUse === '\u200B' && !this.data.description && contentToUse.length < 2048) {
      this.data.description = contentToUse;
      return this;
    }

    const chunks = contentToUse.match(/.{1,1024}/g);
    if (!chunks) return this;

    this.data.fields = [];
    chunks.forEach((chunk) => {
      this.data.fields.push({ name: titleToUse, value: chunk.trim() });
      titleToUse = '\u200B';
    });
    return this;
  }
};

export default RagnarokEmbed;
