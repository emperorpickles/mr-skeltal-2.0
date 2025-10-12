const voice = require('@discordjs/voice');
const { createReadStream } = require('node:fs');

const DEFAULT_PATH = './media/doot.ogg';
const DEFAULT_VOLUME = 1;
const MAX_MISSED_FRAMES = Math.round(2_000 / 20); // tolerate ~2s of network jitter

const createPlayer = () =>
    voice.createAudioPlayer({
        behaviors: {
            maxMissedFrames: MAX_MISSED_FRAMES,
            noSubscriber: voice.NoSubscriberBehavior.Stop,
        },
    });

const createResource = async (file, vol) => {
    const targetPath = file || DEFAULT_PATH;
    const baseVolume = vol ?? DEFAULT_VOLUME;

    try {
        const stream = createReadStream(targetPath);
        const { stream: probedStream, type } = await voice.demuxProbe(stream);
        const resource = voice.createAudioResource(probedStream, {
            inputType: type,
            inlineVolume: true,
        });

        if (resource.volume) {
            resource.volume.setVolume(baseVolume);
        }

        return resource;
    } catch (error) {
        console.error(`Failed to create audio resource for "${targetPath}"`, error);
        throw error;
    }
};

const waitForPlayerStart = async (player) => {
    try {
        await voice.entersState(player, voice.AudioPlayerStatus.Playing, 5e3);
    } catch (error) {
        console.warn('Audio player failed to enter Playing state in time', error);
    }
};

const playFile = async (player, file, vol, waitForStart = false) => {
    console.debug('Playing a file...');
    const resource = await createResource(file, vol);
    player.play(resource);

    if (waitForStart) {
        await waitForPlayerStart(player);
    }

    return resource;
};

const playerEnd = async (player) => {
    const awaitEnd = new Promise((resolve) => {
        player.once(voice.AudioPlayerStatus.Idle, (oldState, newState) => {
            if (oldState.status === voice.AudioPlayerStatus.Playing && newState.status === voice.AudioPlayerStatus.Idle) {
                resolve();
            }
        });
    });
    return awaitEnd;
};

const connectToChannel = async (channel) => {
    const connection = voice.joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });

    try {
        await voice.entersState(connection, voice.VoiceConnectionStatus.Ready, 30e3);
        return connection;
    } catch (error) {
        connection.destroy();
        console.error(`Failed to establish voice connection for guild ${channel.guild.id}`, error);
        throw error;
    }
};

const connectionEnd = (connection) => {
    const awaitEnd = new Promise((resolve) => {
        connection.on('stateChange', (oldState, newState) => {
            if (newState.status === 'destroyed') {
                resolve('destroyed');
            }
        });
    });
    return awaitEnd;
};

const getVoiceConnection = (guildId) => voice.getVoiceConnection(guildId);

module.exports = {
    createPlayer,
    createResource,
    createOggResource: createResource,
    playFile,
    playerEnd,
    connectToChannel,
    connectionEnd,
    getVoiceConnection,
};
