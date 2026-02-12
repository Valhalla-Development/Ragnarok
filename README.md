<div align="center">

# ⚔️ Ragnarok: Multi-Purpose Discord Bot 🚀

  <p>
    <a href="https://discord.gg/Q3ZhdRJ"><img src="https://img.shields.io/discord/495602800802398212.svg?colorB=5865F2&logo=discord&logoColor=white&style=for-the-badge" alt="Discord"></a>
    <a href="https://github.com/Valhalla-Development/Ragnarok/stargazers"><img src="https://img.shields.io/github/stars/Valhalla-Development/Ragnarok.svg?style=for-the-badge&color=yellow" alt="Stars"></a>
    <a href="https://github.com/Valhalla-Development/Ragnarok/network/members"><img src="https://img.shields.io/github/forks/Valhalla-Development/Ragnarok.svg?style=for-the-badge&color=orange" alt="Forks"></a>
    <a href="https://github.com/Valhalla-Development/Ragnarok/issues"><img src="https://img.shields.io/github/issues/Valhalla-Development/Ragnarok.svg?style=for-the-badge&color=red" alt="Issues"></a>
    <a href="https://github.com/Valhalla-Development/Ragnarok/blob/main/LICENSE"><img src="https://img.shields.io/github/license/Valhalla-Development/Ragnarok.svg?style=for-the-badge&color=blue" alt="License"></a>
    <br>
    <a href="https://github.com/Valhalla-Development/Ragnarok"><img src="https://img.shields.io/badge/Open%20Source-GitHub-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"></a>
    <a href="#"><img src="https://img.shields.io/badge/Powered%20by-discord.js-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Powered by discord.js"></a>
    <a href="#"><img src="https://img.shields.io/badge/Made%20with-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="Made with TypeScript"></a>
  </p>

  <p><em>AI, economy, moderation, fun, and utility features in one modern Discord bot.</em></p>
</div>

---
## 🌟 Welcome to Ragnarok!

Ragnarok is a multi-purpose Discord bot built with [discordx](https://discord-x.js.org/) and [discord.js v14](https://discord.js.org/). It includes AI chat with persistent history, economy systems, moderation tools, fun commands, and server utilities.

## 🎮 Features That Power Ragnarok

<table>
  <tr>
    <td width="50%">
      <h3>🤖 OpenRouter AI Chat</h3>
      <p>Use slash commands and mention/reply flow with persistent history and per-guild controls.</p>
    </td>
    <td width="50%">
      <h3>⚙️ AI Control Panel</h3>
      <p>Configure AI globally in <code>/config</code> and per-channel via <code>/aichannels</code>.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>💰 Economy + Progression</h3>
      <p>Server economy systems, XP/levels, and interactive component-driven command flows.</p>
    </td>
    <td width="50%">
      <h3>🗄️ MongoDB Persistence</h3>
      <p>Mongoose-backed persistence for bot data, configs, AI usage, and history.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🎨 Components V2 UI</h3>
      <p>Modern Discord Components V2 containers for cleaner, richer in-app interfaces.</p>
    </td>
    <td width="50%">
      <h3>🛡️ Moderation + Utility</h3>
      <p>Practical moderation, server configuration, and utility tools for day-to-day management.</p>
    </td>
  </tr>
</table>

## 🚀 Requirements

- [Bun](https://bun.sh/) - Fast JavaScript runtime
- [Discord Bot Application](https://discord.com/developers/applications) with bot token
- Optional external service keys (OpenRouter, Valhalla)

## 🛠️ Setup Guide

1. Clone the repository:

   ```bash
   git clone https://github.com/Valhalla-Development/Ragnarok.git
   ```

2. Extract and move the files to your desired location.

3. Install Bun:
   - Mac/Linux:
     ```bash
     curl -fsSL https://bun.sh/install | bash
     ```
   - Windows:
     ```powershell
     powershell -c "irm bun.sh/install.ps1 | iex"
     ```

4. Navigate to your project folder:
    ```bash
    cd /path/to/your/extracted/source
    ```

5. Rename `.env.example` to `.env` and configure your settings:
   - **Required:** Bot token and MongoDB URI
   - [Bot Token Guide](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token)
   - [Channel ID Guide](https://support.discordapp.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-)

6. Install dependencies:
    ```bash
    bun install
    ```

7. Start the bot:
    ```bash
    bun run start
    ```

## 🤝 Contributing

We welcome contributions to improve Ragnarok! If you'd like to contribute:

1. Fork the repository
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes and commit them with a clear, descriptive message:
   ```bash
   git commit -m 'Add feature: brief description of your changes'
   ```
4. Push your changes to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a Pull Request against the main repository's `main` branch

Please ensure your code follows the existing patterns and include clear descriptions in your Pull Request. Focus on performance and user experience improvements.

## 📜 License

This project is licensed under the GPL-3.0 License - see the LICENSE file for details. (It's mostly "Share the love, and keep it open!")

## 🙏 Acknowledgements

- [discord.js](https://discord.js.org/) for the powerful Discord API wrapper
- [discordx](https://discord-x.js.org/) for the decorator-based command framework
- [Bun](https://bun.sh/) for the blazing fast JavaScript runtime
- [MongoDB](https://www.mongodb.com/) for persistence
- [OpenRouter](https://openrouter.ai/) for AI model routing

## 📬 Support & Community

Got questions or need help? Join our [Discord server](https://discord.gg/Q3ZhdRJ) for support and to connect with other Ragnarok users!

---

<div align="center">

💻 Crafted with ❤️ by [Valhalla-Development](https://github.com/Valhalla-Development)
Built on the [ValkyrieCore](https://github.com/Valhalla-Development/ValkyrieCore) Discord bot template.

[🐛 Spotted an issue?](https://github.com/Valhalla-Development/Ragnarok/issues/new?assignees=&labels=bug&projects=&template=bug_report.yml&title=%5BBUG%5D+Short+Description) | [💡 Got an idea?](https://github.com/Valhalla-Development/Ragnarok/issues/new?assignees=&labels=enhancement&projects=&template=feature_request.yml&title=%5BFeature%5D+Short+Description) | [🤔 Need help?](https://discord.gg/Q3ZhdRJ)

<a href="#top">🔝 Back to Top</a>
</div>