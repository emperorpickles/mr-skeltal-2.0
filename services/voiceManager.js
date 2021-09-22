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
    createPlayer: () => {
        return createAudioPlayer();
    },
    playFile: (player, file, vol) => {
        var resource = createAudioResource((file || './media/doot.ogg'), { inputType: StreamType.Arbitrary, inlineVolume: true });
        resource.volume.setVolume(vol || 1);
        player.play(resource);
        return entersState(player, AudioPlayerStatus.Playing, 5e3);
    },
    connectToChannel: async (channel) => {
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
    },
    playerEnd: (player, connection) => {
        player.on('stateChange', (oldState, newState) => {
            if (oldState.status !== 'idle' && newState.status === 'idle') connection.destroy();
        });
    }
}
