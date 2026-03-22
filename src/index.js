import 'dotenv/config';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { DateTime } from 'luxon';
import {
  getDefaultTimezone,
  setDefaultTimezone,
  clearDefaultTimezone,
} from './guildConfig.js';
import { parseWhenToUnixSeconds } from './timeParse.js';
import { normalizeTimezoneInput } from './timezoneAliases.js';

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('Missing DISCORD_TOKEN in environment (.env)');
  process.exit(1);
}

function isValidIana(zone) {
  return DateTime.now().setZone(zone).isValid;
}

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {string | null} override normalized IANA from /time timezone option (already validated when present)
 * @returns {{ zone: string, source: 'override' | 'guild' | 'env' | 'utc' }}
 */
function resolveEffectiveZone(interaction, override) {
  if (override) return { zone: override, source: 'override' };
  if (interaction.guildId) {
    const g = getDefaultTimezone(interaction.guildId);
    if (g) {
      const z = normalizeTimezoneInput(g.trim());
      if (isValidIana(z)) return { zone: z, source: 'guild' };
    }
  }
  const envZ = process.env.DEFAULT_TIMEZONE?.trim();
  if (envZ) {
    const z = normalizeTimezoneInput(envZ);
    if (isValidIana(z)) return { zone: z, source: 'env' };
  }
  return { zone: 'UTC', source: 'utc' };
}

/**
 * @param {string} zone
 * @param {'guild' | 'env' | 'utc'} source
 */
function describeAppliedTimezone(zone, source) {
  switch (source) {
    case 'guild':
      return `**Timezone used:** \`${zone}\` (this server's default).`;
    case 'env':
      return `**Timezone used:** \`${zone}\` (this bot's \`DEFAULT_TIMEZONE\`).`;
    case 'utc':
      return `**Timezone used:** \`${zone}\` (no server default and no bot \`DEFAULT_TIMEZONE\`).`;
    default:
      return `**Timezone used:** \`${zone}\`.`;
  }
}

const timezoneHowToSpecify =
  `**Choose a zone for this command:** add the **timezone** option on \`/time\` — IANA (e.g. \`Europe/Berlin\`) or US shorthands (\`EST\`, \`CST\`, \`PST\`, \`ET\`, \`CT\`, \`PT\`, \`GMT\`, \`ZULU\`, etc.).`;

/** @returns {number} ms to wait before removing the /time ephemeral reply; 0 = keep until dismissed */
function getEphemeralTimeDismissMs() {
  const raw = process.env.EPHEMERAL_TIME_DISMISS_MS;
  if (raw === undefined || raw === '') return 25_000;
  const n = Number.parseInt(String(raw).trim(), 10);
  if (!Number.isFinite(n) || n < 0) return 25_000;
  return n;
}

/**
 * Discord has no “fade” animation for messages; deleting the ephemeral reply is the closest behavior.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {number} ms
 */
function scheduleEphemeralDelete(interaction, ms) {
  if (!ms) return;
  setTimeout(() => {
    interaction.deleteReply().catch(() => {});
  }, ms);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, (c) => {
  console.log(`Ready as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    if (interaction.commandName === 'time') {
      const when = interaction.options.getString('when', true);
      const tzRaw = interaction.options.getString('timezone');
      const style = interaction.options.getString('style') ?? 'f';

      let overrideZone = null;
      if (tzRaw !== null && tzRaw !== undefined) {
        const z = normalizeTimezoneInput(tzRaw.trim());
        if (!isValidIana(z)) {
          await interaction.reply({
            content:
              `Invalid timezone: \`${tzRaw.trim()}\`. Use an IANA name (e.g. \`America/Los_Angeles\`) or a US shorthand (\`EST\`, \`CST\`, \`PST\`, \`ET\`, \`CT\`, \`PT\`, \`GMT\`, \`ZULU\`).`,
            ephemeral: true,
          });
          return;
        }
        overrideZone = z;
      }

      const { zone, source } = resolveEffectiveZone(interaction, overrideZone);

      const unix = parseWhenToUnixSeconds(when, zone);
      if (unix === null) {
        await interaction.reply({
          content:
            'Could not parse that time. Try phrases like `tomorrow 3pm`, `2026-03-22 18:00`, or `in 2 hours`.',
          ephemeral: true,
        });
        return;
      }

      const tag = `<t:${unix}:${style}>`;
      const dismissMs = getEphemeralTimeDismissMs();
      let body =
        `**Preview**\n${tag}\n\n` +
        `**Copy:** \`${tag}\` (tap/click the code) or select the block:\n\`\`\`\n${tag}\n\`\`\`\n\n` +
        `Paste into a message. Others see it in their local time.\n\n`;
      if (dismissMs > 0) {
        const s = Math.round(dismissMs / 1000);
        body += `_Discord bots cannot paste into your clipboard — copy the tag above. This message closes in ~${s}s._`;
      } else {
        body += `_Discord bots cannot paste into your clipboard — copy the tag above._`;
      }
      if (overrideZone === null) {
        body +=
          `\n\n${describeAppliedTimezone(zone, source)}\n\n${timezoneHowToSpecify}`;
      }
      await interaction.reply({
        content: body,
        ephemeral: true,
      });
      scheduleEphemeralDelete(interaction, dismissMs);
      return;
    }

    if (interaction.commandName === 'config') {
      if (!interaction.inGuild()) {
        await interaction.reply({
          content: 'This command only works in a server.',
          ephemeral: true,
        });
        return;
      }

      const group = interaction.options.getSubcommandGroup(false);
      const sub = interaction.options.getSubcommand();
      if (group !== 'timezone') {
        await interaction.reply({ content: 'Unknown subcommand.', ephemeral: true });
        return;
      }

      const guildId = interaction.guildId;
      if (!guildId) {
        await interaction.reply({ content: 'Missing guild.', ephemeral: true });
        return;
      }

      if (sub === 'set') {
        const raw = interaction.options.getString('zone', true).trim();
        const zone = normalizeTimezoneInput(raw);
        if (!isValidIana(zone)) {
          await interaction.reply({
            content:
              `Invalid timezone: \`${raw}\`. Use an IANA name (e.g. \`Europe/Berlin\`) or a US shorthand (\`EST\`, \`CST\`, \`PST\`, etc.).`,
            ephemeral: true,
          });
          return;
        }
        setDefaultTimezone(guildId, zone);
        await interaction.reply({
          content: `Server default timezone set to **${zone}**. \`/time\` will use it when you omit the \`timezone\` option.`,
          ephemeral: true,
        });
        return;
      }

      if (sub === 'clear') {
        clearDefaultTimezone(guildId);
        await interaction.reply({
          content:
            'Server default timezone cleared. `/time` will use `DEFAULT_TIMEZONE` from the bot environment, then UTC.',
          ephemeral: true,
        });
        return;
      }

      if (sub === 'show') {
        const saved = getDefaultTimezone(guildId);
        const savedDisplay = saved ? normalizeTimezoneInput(saved) : null;
        const effective = resolveEffectiveZone(interaction, null).zone;
        await interaction.reply({
          content:
            `**Saved for this server:** ${savedDisplay ? `\`${savedDisplay}\`` : '*(none)*'}\n` +
            `**Effective for /time (no override):** \`${effective}\``,
          ephemeral: true,
        });
        return;
      }
    }
  } catch (err) {
    console.error(err);
    const payload = {
      content: 'Something went wrong processing that command.',
      ephemeral: true,
    };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload);
    } else {
      await interaction.reply(payload);
    }
  }
});

client.login(token);
