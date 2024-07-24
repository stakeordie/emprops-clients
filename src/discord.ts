import { Client, GatewayIntentBits, TextChannel } from "discord.js";

export class DiscordClient {
  private client: Client | null = null;
  private isLogged: boolean = false;

  constructor(private discordToken: string) {
    this.client = new Client({ intents: [GatewayIntentBits.Guilds] });
    this.client.on("error", (error) => {
      console.error("Discord client error", error);
    });

    this.client.on("ready", () => {
      console.log(`Logged in as ${this.client?.user?.tag}!`);
      this.isLogged = true;
    });
    this.client.login(this.discordToken);
  }

  async sendMessage(channelId: string, message: string) {
    if (!this.client) throw new Error("Client is undefined");
    if (!this.isLogged) throw new Error("Client is not logged");

    const channel = this.client.channels.cache.find(
      (channel) => channel.id === channelId
    ) as TextChannel;
    if (!channel) throw new Error("No channel");
    channel.send({
      allowedMentions: {
        parse: ["everyone"],
      },
      content: message,
    });
  }
}
