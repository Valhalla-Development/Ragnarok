export const sudo = class sudo {
  constructor(client) {
    this.client = client;
  }

  async sudo(message, text, user) {
    const { username } = user.user;

    await message.channel
      .createWebhook({
        name: username,
        channel: message.channel,
        avatar: user.user.displayAvatarURL({ extension: 'png' })
      })
      .then((webhook) => {
        webhook.send(text);
        setTimeout(() => {
          webhook.delete();
        }, 3000);
      })
      .catch((error) => {
        console.error(error);
      });
  }
};

export default sudo;
