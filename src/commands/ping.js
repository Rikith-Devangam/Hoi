import { SlashCommandBuilder } from "discord.js";

const ping = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check that CommunityOS is alive."),
  async execute(interaction) {
    const latency = Math.round(interaction.client.ws.ping);
    await interaction.reply(
      `Pong. CommunityOS is online — gateway latency: ${latency}ms.`,
    );
  },
};

// As you add commands, export them all here and index.js will register + route them.
export const commands = [ping];
