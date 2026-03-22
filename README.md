# Discord Timestamp Bot

A Discord bot that turns natural-language times into **dynamic Discord timestamps** (`<t:unix:style>`), so everyone sees the right instant in their own client timezone.

**Repository:** [github.com/brperry/timebot](https://github.com/brperry/timebot)

## Requirements

- [Node.js](https://nodejs.org/) 18 or newer
- A Discord application with a bot user

## Discord application setup

1. Open the [Discord Developer Portal](https://discord.com/developers/applications) and create an application (or pick an existing one).
2. Under **Bot**, create a bot user and copy the **token** (keep it secret).
3. Under **OAuth2**, copy the **Client ID** (this is the application ID).
4. Enable **Privileged Gateway Intents** only if you need them later; this slash-only bot uses the **Guilds** intent only and does not need Message Content.
5. Invite the bot with the **applications.commands** and **bot** scopes. Example (replace `YOUR_CLIENT_ID`):

   `https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot%20applications.commands&permissions=2048`

   `2048` is **Send Messages** so the bot can post command replies in channels.

## Configure locally

1. Clone the repo and install dependencies:

   ```powershell
   cd "path\to\Discord Timestamp Bot"
   npm install
   ```

2. Copy `.env.example` to `.env` and set at least:

   - `DISCORD_TOKEN` — bot token  
   - `CLIENT_ID` — application / client ID  

   Optionally set `GUILD_ID` to your test server ID so slash commands register there immediately while developing. Optionally set `DEFAULT_TIMEZONE` (IANA name) as a fallback when no per-server default exists.

3. Register slash commands (run after any command change):

   ```powershell
   npm run register-commands
   ```

4. Start the bot:

   ```powershell
   npm start
   ```

## Usage

- **`/time`** — Required: `when` (e.g. `tomorrow 3pm`, `2026-03-22 18:00`, `in 2 hours`). Optional: `timezone` (IANA), `style` (Discord `t`/`T`/`d`/`D`/`f`/`F`/`R`). The bot replies with copy-paste `<t:...>` markdown.
- **`/config timezone`** — **Manage Server** only, not in DMs.  
  - `set zone` — server default IANA timezone for `/time` when `timezone` is omitted.  
  - `clear` — remove server default.  
  - `show` — show saved default and effective zone.

Resolution order for ambiguous times when `timezone` is omitted: **optional `/time timezone`** → **server default** → **`DEFAULT_TIMEZONE` in `.env`** → **UTC**.

## License

MIT
