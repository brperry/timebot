import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import { commandData } from '../src/commands.js';

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token) {
  console.error('Missing DISCORD_TOKEN in .env');
  process.exit(1);
}
if (!clientId) {
  console.error('Missing CLIENT_ID (application id) in .env');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);

try {
  if (guildId) {
    console.log(`Registering ${commandData.length} commands to guild ${guildId}...`);
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commandData,
    });
    console.log('Guild commands registered.');
  } else {
    console.log(`Registering ${commandData.length} global commands (may take up to ~1 hour to propagate)...`);
    await rest.put(Routes.applicationCommands(clientId), { body: commandData });
    console.log('Global commands registered.');
  }
} catch (e) {
  console.error(e);
  process.exit(1);
}
