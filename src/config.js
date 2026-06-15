import "dotenv/config";

const required = ["DISCORD_TOKEN", "DISCORD_CLIENT_ID", "GUILD_ID", "MONGODB_URI"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`[config] Missing required env vars: ${missing.join(", ")}`);
  console.error("[config] Copy .env.example to .env and fill in the values.");
  process.exit(1);
}

export const config = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.DISCORD_CLIENT_ID,
  guildId: process.env.GUILD_ID,
  mongoUri: process.env.MONGODB_URI,
};
