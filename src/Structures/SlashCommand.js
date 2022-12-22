import { PermissionsBitField } from 'discord.js';

export const SlashCommand = class SlashCommand {
  constructor(
    client,
    name,
    { type = 1, ownerOnly = null, description = 'No description provided', category, options = [], userPerms, botPerms } = {}
  ) {
    this.client = client;
    this.name = name;
    this.type = type;
    this.ownerOnly = ownerOnly;
    this.description = description;
    this.category = category;
    this.options = options;
    this.userPerms = new PermissionsBitField(userPerms).freeze();
    this.botPerms = new PermissionsBitField(botPerms).freeze();
  }

  // eslint-disable-next-line no-unused-vars
  async run(interaction) {
    throw new Error(`${this.name} does not provide run method !`);
  }
};

export default SlashCommand;
