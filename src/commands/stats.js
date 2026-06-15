import { SlashCommandBuilder, MessageFlags } from "discord.js";
import { ActivityEvent } from "../db/models/ActivityEvent.js";

const DAY_MS = 24 * 60 * 60 * 1000;

const stats = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Show activity stats for this server."),
  async execute(interaction) {
    if (!interaction.inGuild()) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await interaction.deferReply();

    const guildId = interaction.guildId;
    const now = Date.now();
    const since24h = new Date(now - DAY_MS);
    const since7d = new Date(now - 7 * DAY_MS);

    const [totalMessages, messagesLast24h, activeMembers, busiestChannel] =
      await Promise.all([
        ActivityEvent.countDocuments({ guildId }),
        ActivityEvent.countDocuments({ guildId, createdAt: { $gte: since24h } }),
        ActivityEvent.distinct("authorId", {
          guildId,
          createdAt: { $gte: since7d },
        }),
        ActivityEvent.aggregate([
          { $match: { guildId, createdAt: { $gte: since7d } } },
          { $group: { _id: "$channelId", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 1 },
        ]),
      ]);

    const busiest = busiestChannel[0]
      ? `<#${busiestChannel[0]._id}> (${busiestChannel[0].count} messages)`
      : "none";

    await interaction.editReply(
      [
        `**Server stats**`,
        `Total messages tracked: ${totalMessages}`,
        `Messages in the last 24h: ${messagesLast24h}`,
        `Unique active members (7d): ${activeMembers.length}`,
        `Busiest channel (7d): ${busiest}`,
      ].join("\n"),
    );
  },
};

export const commands = [stats];
