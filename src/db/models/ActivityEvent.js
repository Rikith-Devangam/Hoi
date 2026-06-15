import mongoose from "mongoose";

// We log only metadata about each human message — never the message content.
// Counts + timing are all Phase 1 needs to learn a server's "normal" rhythm
// and detect a real dip below baseline.
const activityEventSchema = new mongoose.Schema({
  guildId: { type: String, required: true, index: true },
  channelId: { type: String, required: true, index: true },
  authorId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, index: true },
});

// Compound index for the per-channel, time-windowed queries Phase 1 will run.
activityEventSchema.index({ guildId: 1, channelId: 1, createdAt: -1 });

export const ActivityEvent = mongoose.model("ActivityEvent", activityEventSchema);
