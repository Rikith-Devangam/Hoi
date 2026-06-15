import {
  Client,
  GatewayIntentBits,
  Events,
  REST,
  Routes,
  MessageFlags,
} from "discord.js";
import { config } from "./config.js";
import { connectMongo } from "./db/mongo.js";
import { ActivityEvent } from "./db/models/ActivityEvent.js";
import { commands } from "./commands/ping.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    // Phase 1 adds GatewayIntentBits.MessageContent so we can read recent
    // messages to generate context-aware prompts. Enable the "Message Content
    // Intent" toggle in the Developer Portal now so it's ready then.
  ],
});

const commandMap = new Map(commands.map((cmd) => [cmd.data.name, cmd]));

// Guild commands register instantly (global commands can take up to an hour),
// so we use them for development. The PUT is an upsert, so re-running is safe.
async function registerGuildCommands() {
  const rest = new REST().setToken(config.token);
  await rest.put(
    Routes.applicationGuildCommands(config.clientId, config.guildId),
    { body: commands.map((cmd) => cmd.data.toJSON()) },
  );
  console.log(`[discord] registered ${commands.length} guild command(s)`);
}

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`[discord] logged in as ${readyClient.user.tag}`);
  await registerGuildCommands();
});

// Phase 0 core: log each human message as activity metadata (never content).
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (!message.inGuild()) return;

  try {
    await ActivityEvent.create({
      guildId: message.guildId,
      channelId: message.channelId,
      authorId: message.author.id,
      createdAt: message.createdAt,
    });
  } catch (err) {
    console.error("[activity] failed to log event:", err);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commandMap.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`[command] ${interaction.commandName} failed:`, err);
    const errorReply = {
      content: "Something went wrong running that command.",
      flags: MessageFlags.Ephemeral,
    };
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(errorReply);
    } else {
      await interaction.reply(errorReply);
    }
  }
});

process.on("unhandledRejection", (err) => {
  console.error("[process] unhandled rejection:", err);
});

async function main() {
  await connectMongo();
  await client.login(config.token);
}

main().catch((err) => {
  console.error("[startup] fatal:", err);
  process.exit(1);
});
