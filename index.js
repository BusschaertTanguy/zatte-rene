const { Client, GatewayIntentBits, REST, Routes } = require("discord.js");

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  NoSubscriberBehavior,
  FFmpegPCMAudio,
} = require("@discordjs/voice");

const ffmpeg = require("@ffmpeg-installer/ffmpeg");
const fs = require("fs");
const path = require("path");

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

const playCommandName = "play";

const commands = [
  {
    name: playCommandName,
    description: "Play a random zatte renee sound",
  },
];

client.once("ready", async () => {
  const rest = new REST({ version: "10" }).setToken(TOKEN);

  await rest.put(Routes.applicationCommands(CLIENT_ID), {
    body: commands,
  });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === playCommandName) {
    // TODO: Get random sound name
    const soundName = "";

    const channel = interaction.member.voice.channel;
    if (!channel) {
      return interaction.reply("You must be in a voice channel!");
    }

    const filePath = path.join(__dirname, "sounds", `${soundName}.mp3`);
    if (!fs.existsSync(filePath)) {
      return interaction.reply(`Sound \`${soundName}\` does not exist.`);
    }

    await interaction.reply(`Playing **${soundName}**`);

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Stop,
      },
    });

    const resource = createAudioResource(
      new FFmpegPCMAudio(filePath, { executablePath: ffmpeg.path })
    );

    connection.subscribe(player);
    player.play(resource);

    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });

    player.on("error", (err) => {
      console.error("Audio error:", err);
      connection.destroy();
    });
  }
});

client.login(TOKEN);
