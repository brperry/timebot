import {
  SlashCommandBuilder,
  PermissionFlagsBits,
} from 'discord.js';

const styleChoices = [
  { name: 'Short date/time (f)', value: 'f' },
  { name: 'Long date/time (F)', value: 'F' },
  { name: 'Relative (R)', value: 'R' },
  { name: 'Time short (t)', value: 't' },
  { name: 'Time long (T)', value: 'T' },
  { name: 'Date short (d)', value: 'd' },
  { name: 'Date long (D)', value: 'D' },
];

export const timeCommand = new SlashCommandBuilder()
  .setName('time')
  .setDescription('Convert a time phrase into a Discord dynamic timestamp')
  .addStringOption((opt) =>
    opt
      .setName('when')
      .setDescription('e.g. tomorrow 3pm, March 22 2026 18:00, in 2 hours')
      .setRequired(true)
  )
  .addStringOption((opt) =>
    opt
      .setName('timezone')
      .setDescription('IANA zone for ambiguous times (overrides server default)')
      .setRequired(false)
  )
  .addStringOption((opt) =>
    opt
      .setName('style')
      .setDescription('Discord timestamp style')
      .setRequired(false)
      .addChoices(...styleChoices)
  );

export const configCommand = new SlashCommandBuilder()
  .setName('config')
  .setDescription('Server settings (Manage Server only)')
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommandGroup((group) =>
    group
      .setName('timezone')
      .setDescription('Default timezone for /time')
      .addSubcommand((sub) =>
        sub
          .setName('set')
          .setDescription('Set the server default IANA timezone')
          .addStringOption((opt) =>
            opt
              .setName('zone')
              .setDescription('e.g. America/New_York, Europe/Berlin')
              .setRequired(true)
          )
      )
      .addSubcommand((sub) =>
        sub.setName('clear').setDescription('Remove the server default timezone')
      )
      .addSubcommand((sub) =>
        sub
          .setName('show')
          .setDescription('Show saved default and effective zone for /time')
      )
  );

export const commandData = [timeCommand, configCommand].map((c) =>
  c.toJSON()
);
