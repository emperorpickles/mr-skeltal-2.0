const voice = require('@discordjs/voice');
const { createReadStream } = require('node:fs');

module.exports = {
    createPlayer: () => {
        return voice.createAudioPlayer();
    },
    createResource: (file, vol) => {
        const resource = voice.createAudioResource(file, { inputType: voice.StreamType.OggOpus, inlineVolume: true });
        resource.volume.setVolume(vol || 1);
        return resource;
    },
    createOggResource: (file) => {
        return voice.createAudioResource(createReadStream(file, { inputType: voice.StreamType.OggOpus }));
    },
    playFile: (player, file, vol) => {
        const resource = voice.createAudioResource((file || './media/doot.ogg'), { inputType: voice.StreamType.OggOpus, inlineVolume: true });
        resource.volume.setVolume(vol || 1);
        player.play(resource);
    },
    playerEnd: async (player) => {
        const awaitEnd = new Promise((resolve, reject) => {
            player.once(voice.AudioPlayerStatus.Idle, (oldState, newState) => {
                if (oldState.status === 'playing' && newState.status === 'idle') {
                    resolve();
                }
            });
        });
        return awaitEnd;
    },
    connectToChannel: async (channel) => {
        const connection = voice.joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });
        return await voice.entersState(connection, voice.VoiceConnectionStatus.Ready, 30e3);
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
    getVoiceConnection: (guildId) => {
        return voice.getVoiceConnection(guildId);
    }
}
