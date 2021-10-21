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
    createResource: (file, vol) => {
        var resource = createAudioResource(file, { inputType: StreamType.OggOpus, inlineVolume: true });
        resource.volume.setVolume(vol || 1);
        return resource;
    },
    playFile: (player, file, vol) => {
        var resource = createAudioResource((file || './media/doot.ogg'), { inputType: StreamType.Arbitrary, inlineVolume: true });
        resource.volume.setVolume(vol || 1);
        player.play(resource);
        return entersState(player, AudioPlayerStatus.Playing, 5e3);
    },
    playerEnd: (player) => {
        const awaitIdle = new Promise((resolve, reject) => {
            player.on('stateChange', (oldState, newState) => {
                if (oldState.status === 'playing' && newState.status === 'idle') {
                    resolve('idle');
                }
            });
        });
        return awaitIdle;
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
            if (connection) connection.destroy();
            throw err;
        }
    },
    connectionEnd: (connection) => {
        const awaitEnd = new Promise((resolve, reject) => {
            connection.on('stateChange', (oldState, newState) => {
                if (newState.status === 'destroyed') {
                    resolve('destroyed');
                }
            });
        });
        return awaitEnd;
    },
}
