require("dotenv").config();
const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  NoSubscriberBehavior,
  StreamType,
} = require("@discordjs/voice");

const fs = require("fs");
const path = require("path");

const getRandomSound = () => {
  const soundsDirectory = path.join(__dirname, "sounds");

  const files = fs.readdirSync(soundsDirectory).filter((f) => f.endsWith(".mp3"));

  if (!files.length) {
    throw new Error("No .mp3 files found in sounds directory");
  }

  const randomFile = files[Math.floor(Math.random() * files.length)];
  return path.join(soundsDirectory, randomFile);
};

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.DISCORD_CLIENT_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

const playCommandName = "rene";

const commands = [
  {
    name: playCommandName,
    description: "Play a random zatte renee sound",
  },
];

client.once("clientReady", async () => {
  const rest = new REST({ version: "10" }).setToken(TOKEN);

  await rest.put(Routes.applicationCommands(CLIENT_ID), {
    body: commands,
  });
});

client.on("interactionCreate", async (interaction) => {
  try {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === playCommandName) {
      const channel = interaction.member.voice.channel;
      if (!channel) {
        return interaction.reply("Das ne voice channel ? Nee ? Kruipt er dan in he.");
      }

      const filePath = getRandomSound();

      await interaction.reply("Kzal is iets zeggen pol.");

      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

      const player = createAudioPlayer({
        behaviors: {
          noSubscriber: NoSubscriberBehavior.Play,
        },
      });

      const resource = createAudioResource(filePath, { inputType: StreamType.Arbitrary });

      connection.subscribe(player);

      setTimeout(() => {
        player.play(resource);
      }, 300);

      player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
      });

      player.on("error", async (err) => {
        await interaction.reply("Kem een probleem Pol, kziew er a.");
        console.error("Audio error:", err);
        connection.destroy();
      });
    }
  } catch (error) {
    await interaction.reply("Kem een probleem Pol, kziew er a.");
    console.error(error);
  }
});

client.login(TOKEN);
