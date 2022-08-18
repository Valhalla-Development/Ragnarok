export const sudo = class sudo {
  constructor(client) {
    this.client = client;
  }

  async sudo(message, text, user) {
    message.channel
      .createWebhook({
        name: user.user.username,
        channel: message.channel,
        avatar: user.user.displayAvatarURL({ extension: 'png' })
      })
      .then((webhook) => {
        webhook.send(text);
        setTimeout(() => {
          webhook.delete();
        }, 3000);
      });
  }
};

export default sudo;
