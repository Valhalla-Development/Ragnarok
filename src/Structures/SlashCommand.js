import { PermissionsBitField } from 'discord.js';

export const SlashCommand = class SlashCommand {
  constructor(client, name, options = {}) {
    this.client = client;
    this.name = options.name || name;
    this.type = options.type || 1;
    this.ownerOnly = options.ownerOnly || null;
    this.description = this.type === 1 ? options.description || 'No description provided' : undefined;
    this.options = options.options || [];
    this.userPerms = new PermissionsBitField(options.userPerms).freeze();
    this.botPerms = new PermissionsBitField(options.botPerms).freeze();
  }

  // eslint-disable-next-line no-unused-vars
  async run(interaction) {
    throw new Error(`${this.name} does not provide run method !`);
  }
};

export default SlashCommand;
