const { SlashCommandBuilder } = require('@discordjs/builders');
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    entersState,
    StreamType,
    AudioPlayerStatus,
    VoiceConnectionStatus,
} = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('doot')
        .setDescription('doot doot'),
    async execute(interaction) {
        // audio player setup
        const player = createAudioPlayer();
        function playSong() {
            const resource = createAudioResource('./doot.ogg', { inputType: StreamType.Arbitrary });
            player.play(resource);
            return entersState(player, AudioPlayerStatus.Playing, 5e3);
        }

        async function connectToChannel(channel) {
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
            });
            try {
                await entersState(connection, VoiceConnectionStatus.Ready, 30e3);
                return connection;
            } catch (err) {
                connection.destroy();
                throw err;
            }
        }

        const channel = interaction.member?.voice.channel;
        if (channel) {
            try {
                // create audio player
                await playSong();
                console.log('Ready to play');

                // join voice channel and play audio file
                const connection = await connectToChannel(channel);
                interaction.reply('DOOT DOOT');
                connection.subscribe(player);
                await entersState(player, AudioPlayerStatus.Idle, 5e3);
                connection.destroy();
            } catch (err) {
                console.error(err);
            }
        } else {
            message.reply('Join a voice channel');
        }
    },
};