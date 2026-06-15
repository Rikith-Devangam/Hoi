# CommunityOS — Phase 0 (Foundations)

The first vertical slice: a Discord bot that is **alive in your server**, **logs message activity** (metadata only) to MongoDB, and **responds to a `/ping`** slash command. This is the plumbing everything else is built on — Phase 1 (dip detection + context-aware prompts) reads the activity data this phase collects.

## Stack
- **discord.js v14** (Node)
- **MongoDB Atlas** (storage)
- **dotenv** (config)
- ESM (`"type": "module"`), no TypeScript

## What it does
- Connects to Discord and logs in.
- On every human message in a server, writes one `ActivityEvent` to Mongo: `guildId`, `channelId`, `authorId`, `createdAt`. **No message content is stored** — only what's needed to learn the server's rhythm later.
- Registers and answers a `/ping` command.

---

## Setup (from scratch)

### 0. Prerequisites
- **Node.js 20 LTS** (18+ works; 20 recommended). Check: `node -v`
- A free **MongoDB Atlas** account.

### 1. Create the Discord application + bot
1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) → **New Application** → name it (e.g. CommunityOS).
2. **General Information** → copy the **Application ID** → this is your `DISCORD_CLIENT_ID`.
3. **Bot** (left sidebar) → **Reset Token** → copy it → this is your `DISCORD_TOKEN`. (Treat it like a password.)
4. Still on the **Bot** page, under **Privileged Gateway Intents**, turn ON **Message Content Intent**. (Phase 0 doesn't read content, but Phase 1 will — enabling it now means no extra step later.)

### 2. Invite the bot to your test server
1. **OAuth2** → **URL Generator**.
2. Scopes: check **`bot`** and **`applications.commands`**.
3. Bot Permissions: check **View Channels**, **Send Messages**, **Read Message History**.
4. Copy the generated URL, open it, and add the bot to a server you own (use a throwaway test server).

### 3. Get your test server ID
1. In Discord: **User Settings → Advanced → Developer Mode** ON.
2. Right-click your server icon → **Copy Server ID** → this is your `GUILD_ID`.

### 4. Set up MongoDB Atlas
1. Create a free cluster.
2. **Database Access** → add a database user (username + password).
3. **Network Access** → allow your IP (or `0.0.0.0/0` for testing only).
4. **Connect → Drivers** → copy the connection string → this is your `MONGODB_URI` (swap in your user/password).

### 5. Configure and run
```bash
cp .env.example .env      # then fill in the four values
npm install
npm start
```

You should see `[mongo] connected` and `[discord] logged in as ...`.

---

## Verify Phase 0 is done
- Type a few messages in your test server → check the `activityevents` collection in Atlas; you should see new documents.
- Run `/ping` in the server → the bot replies with gateway latency.

If both work, Phase 0 is complete and you're collecting the data Phase 1 needs.

## Next: Phase 1 (the Heartbeat)
Once this has logged activity for a few days (enough to learn a baseline), we add: per-channel/per-hour/per-weekday baselines, dip detection during normally-active windows, recent-message context gathering, LLM prompt generation, and the cooldown/backoff guardrails.
